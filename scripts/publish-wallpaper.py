"""Publish an authorized image/video to R2 and update its catalog."""
import hashlib
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

CATALOG = Path("data/wallpapers.json")
ADULT_METADATA = re.compile(r"\\b(?:nsfw|hentai|ecchi|nude|nudity|naked|porn(?:ography)?|sexual|sex|lewd|fetish|explicit|erotic|r18|r-18|18\\+|lingerie|bikini|underwear|boobs?|breasts?|nipples?|onlyfans|rule\\s*34|rule34)\\b", re.I)
TYPES = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif",
    ".mp4": "video/mp4", ".webm": "video/webm",
}

def https_url(key):
    value = os.environ[key].strip()
    parsed = urlparse(value)
    assert parsed.scheme == "https" and parsed.netloc and not parsed.username, f"{key} must be a public HTTPS URL"
    assert parsed.hostname not in ("localhost", "127.0.0.1", "::1"), "Local addresses are not allowed"
    return value

def prepare():
    https_url("INPUT_URL")
    https_url("INPUT_SOURCE")
    assert os.environ["INPUT_PERMISSION"] in ("own-work", "open-license", "written-permission")
    for key in ("INPUT_TITLE", "INPUT_CREATOR", "INPUT_LICENSE"):
        assert os.environ[key].strip(), f"{key} is required"
    assert os.environ["INPUT_TYPE"] in ("image", "video")
    assert https_url("R2_PUBLIC_URL")
    assert os.environ.get("INPUT_SFW_CONFIRM", "").lower() == "true", "SFW and no-memes confirmation is mandatory"
    summary = " ".join(os.environ[k] for k in ("INPUT_TITLE", "INPUT_CREATOR", "INPUT_LICENSE"))
    assert not ADULT_METADATA.search(summary), "Adult-themed metadata is not allowed"

def inspect():
    body = Path("media-upload").read_bytes()
    assert 0 < len(body) <= 100 * 1024 * 1024, "Media must be 1 byte to 100 MB"
    path = urlparse(os.environ["INPUT_URL"]).path.lower()
    ext = Path(path).suffix
    assert ext in TYPES, "URL must end in a supported file extension"
    ctype = TYPES[ext]
    assert ctype.startswith(os.environ["INPUT_TYPE"] + "/"), "Declared media type mismatch"
    assert (
        (ext in (".jpg", ".jpeg") and body.startswith(bytes.fromhex("ffd8ff"))) or
        (ext == ".png" and body.startswith(bytes.fromhex("89504e470d0a1a0a"))) or
        (ext == ".gif" and body.startswith((b"GIF87a", b"GIF89a"))) or
        (ext == ".webp" and body.startswith(b"RIFF") and body[8:12] == b"WEBP") or
        (ext == ".mp4" and body[4:8] == b"ftyp") or
        (ext == ".webm" and body.startswith(bytes.fromhex("1a45dfa3")))
    ), "Downloaded content does not match media type"
    key = "anime/" + hashlib.sha256(body).hexdigest()[:24] + ext
    Path(".upload-key").write_text(key)
    Path(".media-type").write_text(ctype)

def catalog():
    key = Path(".upload-key").read_text()
    base = https_url("R2_PUBLIC_URL").rstrip("/")
    items = json.loads(CATALOG.read_text(encoding="utf-8"))
    url = base + "/" + key
    if not any(x.get("url") == url for x in items):
        items.append({
            "id": "user-" + key.rsplit("/", 1)[-1].split(".", 1)[0],
            "title": os.environ["INPUT_TITLE"].strip(),
            "url": url,
            "creator": os.environ["INPUT_CREATOR"].strip(),
            "source": https_url("INPUT_SOURCE"),
            "license": os.environ["INPUT_LICENSE"].strip(),
            "permission": os.environ["INPUT_PERMISSION"],
            "type": os.environ["INPUT_TYPE"],
            "contentRating": "sfw",
            "editorialApproval": "uploader-sfw-attestation",
            "category": "Anime",
            "description": "Creator-authorized SFW anime wallpaper."
        })
        CATALOG.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

if __name__ == "__main__":
    import sys
    globals()[sys.argv[1]]()
