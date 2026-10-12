# AnimeWallora

An English-language, open-source anime wallpaper website built with static HTML, CSS and JavaScript. Hosted through GitHub Pages.

## What's live
- On-page GIPHY anime animation embeds; not mirrored or downloadable as local files
- Dynamic gallery ready for **rights-cleared** wallpaper and video assets
- Direct media links through `data/wallpapers.json` once Cloudflare R2 (or similar HTTPS media hosting) is connected
- Search, mobile-first responsive layout, credits and source information
- GitHub Actions validation of the wallpaper catalog and mandatory permission metadata

## Rights and licensing
The four earlier generated vector wallpapers were removed on request. The download catalog is initially empty because no verified creator-licensed downloadable anime media has yet been supplied or approved. Open-sourcing this website's code does not make third-party anime images free to redistribute. Attribution alone is not permission.

GIPHY's API documentation forbids media caching/rehosting without approval. Wallper disallows redistributing its service without written permission. MoeWalls / MotionBGS media must be approved by its actual copyright holders prior to mirroring.

## Setup
- Read [MEDIA_SETUP.md](MEDIA_SETUP.md) for Cloudflare R2 storage and adding approved media.
- Host from Settings → Pages → Deploy from main branch → root directory.
- Website: https://eliron8565.github.io/Wallpapers/

## Contributing
Contribute anime wallpapers/videos only if you are the creator or have explicit rights to share. Provide creator, source, license/permission statement, original media format, and credit. Update `data/wallpapers.json` following MEDIA_SETUP instructions. GitHub Actions will validate metadata but cannot independently certify ownership.

Website code is MIT-licensed (see LICENSE). This does not apply to third-party media.
