"""Validate AnimeWallora's permission and SFW-only editorial catalogs."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

BANNED = re.compile(r"\b(?:nsfw|hentai|ecchi|nude|nudity|naked|porn(?:ography)?|sexual|sex|lewd|fetish|explicit|erotic|r18|r-18|18\+|lingerie|bikini|underwear|boobs?|breasts?|nipples?|onlyfans|rule\s*34|rule34)\b", re.I)
MEDIA_TYPES = {"image", "video"}
PERMISSIONS = {"own-work", "open-license", "written-permission"}

def check_sfw(item, i, source):
    assert item.get("contentRating") == "sfw", f"{source} entry {i}: SFW editorial approval required"
    fields = (item.get("title"), item.get("series"), item.get("category"), item.get("character"), item.get("description"))
    strings = [s for s in fields if isinstance(s, str)] + [t for t in item.get("tags", []) if isinstance(t, str)]
    assert not BANNED.search(" ".join(strings)), f"{source} entry {i}: adult-themed keyword detected"

items = json.loads(Path("data/wallpapers.json").read_text(encoding="utf-8"))
assert isinstance(items, list), "Wallpaper catalog must be a JSON array"
ids = set()
for i, item in enumerate(items):
    assert isinstance(item, dict), f"Entry {i}: expected object"
    for field in ("id", "title", "url", "creator", "license", "source", "permission"):
        assert isinstance(item.get(field), str) and item[field].strip(), f"Entry {i}: missing {field}"
    assert item["id"] not in ids, f"Duplicate wallpaper id: {item['id']}"
    ids.add(item["id"])
    assert urlparse(item["url"]).scheme == "https", f"Entry {i}: HTTPS is required"
    assert urlparse(item["source"]).scheme == "https", f"Entry {i}: creator/source page URL required"
    assert item.get("type", "image") in MEDIA_TYPES, f"Entry {i}: invalid type"
    assert item["permission"] in PERMISSIONS, f"Entry {i}: documented permission required"
    assert item.get("id") != "wc-01", "Rejected sexualized artwork must never return"
    assert "on_the_edge_-_free_world_version" not in str(item.get("source", "")).lower(), "Rejected artwork source"
    assert "717232c76f96029032d65a537da4" not in str(item.get("url", "")), "Rejected media object"
    check_sfw(item, i, "wallpaper")

gifs = json.loads(Path("data/anime-gifs.json").read_text(encoding="utf-8"))
assert isinstance(gifs, list), "GIPHY catalog must be a JSON array"
gif_ids = set()
for i, item in enumerate(gifs):
    assert isinstance(item, dict), f"GIPHY entry {i}: expected object"
    check_sfw(item, i, "giphy")
    for field in ("title", "creator", "series", "giphyId"):
        assert isinstance(item.get(field), str) and item[field].strip(), f"GIPHY entry {i}: missing {field}"
    gid = item["giphyId"]
    assert re.fullmatch(r"[A-Za-z0-9]{12,32}", gid), f"GIPHY entry {i}: invalid ID"
    assert gid not in gif_ids, f"GIPHY entry {i}: duplicate ID"
    gif_ids.add(gid)
    assert item.get("type") == "giphy"
    assert item.get("source") == "https://giphy.com/gifs/" + gid
print(f"Validated {len(items)} licensed SFW wallpapers and {len(gifs)} SFW-tagged GIPHY embeds.")
