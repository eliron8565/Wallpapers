import json
from pathlib import Path
from urllib.parse import urlparse

items = json.loads(Path("data/wallpapers.json").read_text(encoding="utf-8"))
assert isinstance(items, list), "Catalog must be a JSON array"
for i, item in enumerate(items):
    assert isinstance(item, dict), f"Entry {i}: expected object"
    for field in ("title", "url", "creator", "license", "source", "permission"):
        assert isinstance(item.get(field), str) and item[field].strip(), f"Entry {i}: missing {field}"
    assert urlparse(item["url"]).scheme == "https", f"Entry {i}: HTTPS is required"
    assert urlparse(item["source"]).scheme == "https", f"Entry {i}: creator/source page URL required"
    assert item.get("type", "image") in ("image", "video"), f"Entry {i}: invalid type"
    assert item["permission"] in ("own-work", "open-license", "written-permission"), f"Entry {i}: documented permission required"
print(f"Validated {len(items)} rights-cleared wallpapers.")
