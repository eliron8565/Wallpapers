"""Create fast, SFW-curated, resized previews for original Commons wallpapers in R2."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
from PIL import Image, ImageOps

CATALOG = Path("data/wallpapers.json")
BUCKET = "animewallora-media"

def run(args, env):
    subprocess.run(args, check=True, env=env, stdout=subprocess.DEVNULL)

def main():
    account = os.environ.get("R2_ACCOUNT_ID", "")
    base = os.environ.get("R2_PUBLIC_URL", "").rstrip("/")
    if len(account) != 32 or not all(x in "0123456789abcdefABCDEF" for x in account):
        raise ValueError("R2_ACCOUNT_ID is invalid")
    if not base.startswith("https://"):
        raise ValueError("R2_PUBLIC_URL must be HTTPS")
    endpoint = "https://" + account + ".r2.cloudflarestorage.com"
    env = os.environ.copy()
    env.update({
        "AWS_ACCESS_KEY_ID": os.environ["R2_ACCESS_KEY_ID"],
        "AWS_SECRET_ACCESS_KEY": os.environ["R2_SECRET_ACCESS_KEY"],
        "AWS_DEFAULT_REGION": "auto",
    })
    items = json.loads(CATALOG.read_text(encoding="utf8"))
    done, errors = 0, []
    for item in items:
        if item.get("contentRating") != "sfw" or item.get("hostedOn") != "Cloudflare R2":
            continue
        if item.get("type") != "image" or item.get("filename", "").lower().endswith(".gif"):
            continue
        original = item.get("url", "")
        if not original.startswith(base + "/licensed-anime/"):
            continue
        if "/thumbnails/" in item.get("thumbnail", ""):
            continue
        source_key = original[len(base) + 1:]
        key = "thumbnails/" + hashlib.sha256(source_key.encode("utf8")).hexdigest()[:28] + ".webp"
        try:
            with tempfile.TemporaryDirectory() as folder:
                raw = Path(folder) / "source"
                preview = Path(folder) / "preview.webp"
                run(["aws", "s3", "cp", "s3://" + BUCKET + "/" + source_key,
                     str(raw), "--endpoint-url", endpoint, "--only-show-errors"], env)
                with Image.open(raw) as image:
                    image = ImageOps.exif_transpose(image)
                    image.thumbnail((900, 900), Image.Resampling.LANCZOS)
                    if image.mode not in ("RGB", "RGBA"):
                        image = image.convert("RGB")
                    image.save(preview, format="WEBP", quality=80, method=5)
                run(["aws", "s3", "cp", str(preview), "s3://" + BUCKET + "/" + key,
                     "--endpoint-url", endpoint, "--content-type", "image/webp",
                     "--cache-control", "public, max-age=31536000, immutable",
                     "--only-show-errors"], env)
                item["thumbnail"] = base + "/" + key
                item["thumbnailOptimized"] = True
                done += 1
                print("Thumbnail generated:", item.get("title"), flush=True)
        except Exception as error:
            errors.append((item.get("title"), str(error)))
            print("Failed thumbnail:", item.get("title"), error, flush=True)
    if done:
        CATALOG.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"Preview generation: {done} optimized, {len(errors)} skipped", flush=True)
    if errors and not done:
        raise RuntimeError("No previews could be optimized.")

if __name__ == "__main__":
    main()
