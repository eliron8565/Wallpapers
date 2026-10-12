"""Mirror a curated, freely licensed Commons gallery into the owner's Cloudflare R2 bucket.

Only Wikimedia Commons files whose *current* API metadata confirms the explicitly
declared open license are eligible. This is not a generic web scraper.
"""
import hashlib
import json
import mimetypes
import os
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "AnimeWallora/1.0 (https://github.com/eliron8565/Wallpapers; licensed Commons mirror)"}
CATALOG = Path("data/wallpapers.json")
ACCEPTED = {"ccby30", "ccby40", "ccbysa30", "ccbysa40", "cc0"}
MEDIA_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}


def fetch_json(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers=HEADERS), timeout=40) as resp:
                return json.load(resp)
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 2)


def metadata(filename):
    params = urlencode({"action": "query", "format": "json", "formatversion": "2",
                        "prop": "imageinfo", "titles": "File:" + filename,
                        "iiprop": "url|size|mime|extmetadata"})
    data = fetch_json(API + "?" + params)
    pages = data["query"]["pages"]
    info = pages[0].get("imageinfo", [None])[0]
    if not info or not info.get("url"):
        raise ValueError("Original file cannot be located on Commons")
    return info


def license_key(s):
    return "".join(c for c in s.lower() if c.isalnum())


def get_file(url, destination):
    loc = urlparse(url)
    if loc.scheme != "https" or loc.hostname not in ("upload.wikimedia.org", "commons.wikimedia.org"):
        raise ValueError("Media URL must come directly from Wikimedia Commons")
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=120) as source, open(destination, "wb") as dest:
        total = 0
        while chunk := source.read(256 * 1024):
            total += len(chunk)
            if total > 30 * 1024 * 1024:
                raise ValueError("Maximum file size is 30 MB")
            dest.write(chunk)
    if total < 100:
        raise ValueError("Source file is empty or unexpectedly small")
    return total


def sync(item, endpoint, public):
    source = item.get("source", "")
    if not source.startswith("https://commons.wikimedia.org/wiki/File:"):
        raise ValueError("Only verified Wikimedia Commons file pages can be mirrored")
    if item.get("permission") != "open-license":
        raise ValueError("Only open-licensed entries qualify")
    filename = item.get("filename", "")
    ext = Path(filename).suffix.lower()
    if not filename or ext not in MEDIA_TYPES:
        raise ValueError("Missing/unsupported Commons filename")
    meta = metadata(filename)
    actual = meta.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "")
    expected = item.get("license", "")
    if license_key(actual) != license_key(expected) or license_key(actual) not in ACCEPTED:
        raise ValueError(f"License mismatch: expected {expected!r}, Commons states {actual!r}")
    if meta.get("mime") != MEDIA_TYPES[ext]:
        raise ValueError("MIME type mismatch")
    with tempfile.TemporaryDirectory() as tmp:
        destination = Path(tmp) / ("download" + ext)
        size = get_file(meta["url"], destination)
        raw = destination.read_bytes()
        if ext in (".jpg", ".jpeg") and not raw.startswith(b"\xff\xd8\xff"):
            raise ValueError("Invalid JPEG signature")
        if ext == ".png" and not raw.startswith(b"\x89PNG\r\n\x1a\n"):
            raise ValueError("Invalid PNG signature")
        if ext == ".gif" and not raw.startswith((b"GIF87a", b"GIF89a")):
            raise ValueError("Invalid GIF signature")
        key = "licensed-anime/" + hashlib.sha256(raw).hexdigest()[:28] + ext
        object_url = public + "/" + key
        env = os.environ.copy()
        env["AWS_ACCESS_KEY_ID"] = os.environ["R2_ACCESS_KEY_ID"]
        env["AWS_SECRET_ACCESS_KEY"] = os.environ["R2_SECRET_ACCESS_KEY"]
        env["AWS_DEFAULT_REGION"] = "auto"
        subprocess.run(["aws", "s3", "cp", str(destination), f"s3://animewallora-media/{key}",
                       "--endpoint-url", endpoint, "--content-type", MEDIA_TYPES[ext],
                       "--no-progress", "--only-show-errors"], env=env, check=True)
    item["url"] = object_url
    item["thumbnail"] = object_url
    item["downloadUrl"] = object_url
    item["hostedOn"] = "Cloudflare R2"
    print(f"Uploaded {item['title']} ({size // 1024} KiB), confirmed license: {actual}")


def main():
    account = os.environ.get("R2_ACCOUNT_ID", "")
    public = os.environ.get("R2_PUBLIC_URL", "").rstrip("/")
    if len(account) != 32 or not all(ch in "0123456789abcdefABCDEF" for ch in account):
        raise ValueError("Missing or invalid R2 account ID")
    if not public.startswith("https://"):
        raise ValueError("R2_PUBLIC_URL must begin with https://")
    endpoint = f"https://{account}.r2.cloudflarestorage.com"
    items = json.loads(CATALOG.read_text(encoding="utf8"))
    count = 0
    failures = []
    for item in items:
        if not item.get("filename") or item.get("hostedOn") == "Cloudflare R2":
            continue
        try:
            sync(item, endpoint, public)
            count += 1
        except Exception as exc:
            failures.append((item.get("title", "Unknown"), str(exc)))
            print("Skipped:", item.get("title"), "—", exc)
    if count:
        CATALOG.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(f"Sync complete: {count} new R2 uploads; {len(failures)} skipped.")
    if failures and not count:
        raise RuntimeError("No approved Commons artworks could be synced; see logs above.")


if __name__ == "__main__":
    main()
