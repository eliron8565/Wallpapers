# ✦ AnimeWallora — Anime Wallpapers, GIFs & Images

**Website:** https://eliron8565.github.io/Wallpapers/

[![Website smoke tests](https://github.com/eliron8565/Wallpapers/actions/workflows/test-site.yml/badge.svg)](https://github.com/eliron8565/Wallpapers/actions/workflows/test-site.yml)

## What's here

AnimeWallora is a fan-made SFW-curated anime GIF, illustration and wallpaper gallery. It uses images by independent artists and GIFs **embedded** from the original GIPHY host — no AI-generated wallpapers are made for this project.

- **103 original artwork source entries (licensed / Commons verification on upload)** sourced from Wikimedia Commons, including safe fantasy art, manga-inspired portraits, cyberpunk scenes, Gojo & Naruto fan sketches and Pepper & Carrot artwork.
- **73 anime GIF embeds** from GIPHY source pages, with Demon Slayer, Jujutsu Kaisen, Bleach, Naruto, One Piece, Dragon Ball, My Hero Academia and Mob Psycho 100 represented.
- Cloudflare R2 hosts approved static artworks (not GIPHY GIF files); records are added as source URLs first and switched to R2 URLs only after the Commons metadata and license check succeeds.
- Responsive dark design, anime filters, series and character search, full previews, immersive fullscreen GIF playback, favorites saved on your device.
- GIPHY GIFs are preview-only; they cannot be directly downloaded from AnimeWallora without source rights.
- A reporting link on every preview lets viewers flag memes, wrong anime labels, adult material or other inappropriate content.

## SFW policy

**NSFW, nudity, pornography, hentai, erotic imagery and sexual content are not allowed.** The catalogs [data/anime-gifs.json](data/anime-gifs.json) and [data/wallpapers.json](data/wallpapers.json) must explicitly contain `contentRating: "sfw"`. The front end excludes unrated or disallowed entries; [catalog validation](scripts/validate-catalog.py) and GitHub Actions also block common sexual/adult keywords. The manual [media publishing workflow](.github/workflows/publish-wallpaper.yml) requires a specific SFW and no-memes confirmation.

These safeguards are a **metadata/editorial filter, not automated computer-vision nudity detection**, and cannot guarantee zero false negatives inside third-party GIF player embeds. If anything inappropriate slips through, use the *Flag wrong or meme GIF* link in its preview or [file an issue](https://github.com/eliron8565/Wallpapers/issues/new); the curator should remove the embed.

## More images and downloads

Additional, individually selected safe-themed wallpapers use Commons CC-BY licenses and are synced via [Sync approved Commons anime art to R2](.github/workflows/sync-commons-r2.yml). That workflow checks the exact image's Commons API filename, MIME type and declared license **before** copying it to R2. The [thumbnail optimizer](.github/workflows/optimize-thumbnails.yml) creates smaller WebP preview assets but leaves downloadable originals untouched.

New creator-licensed GIF/MP4 files can be uploaded manually if you hold redistribution rights and confirm they are SFW. Public R2 dev URLs are for testing and subject to limits. Secrets never belong in the repository source.

## Copyright

Website **source code** is MIT licensed under [LICENSE](LICENSE). Artwork and GIFs retain their original copyright and licensing, independent of the code. The Commons license and actual artist are linked on individual static-art previews, including independent fan art. GIPHY embeds remain hosted by GIPHY. MoeWalls and Wallper are useful discovery sources but their copyrighted files are **not mirrored** into R2 without explicit rights-holder permission. Credits alone do not grant those rights.

Serve `index.html` locally with `python -m http.server 8000` since file:// blocks catalog fetches in some browsers.
