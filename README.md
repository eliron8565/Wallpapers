# ✦ AnimeWallora — Anime Wallpapers, GIFs & Images

**Website:** https://eliron8565.github.io/Wallpapers/

[![Website smoke tests](https://github.com/eliron8565/Wallpapers/actions/workflows/test-site.yml/badge.svg)](https://github.com/eliron8565/Wallpapers/actions/workflows/test-site.yml)

## The gallery

AnimeWallora is an independent, English-language anime wallpaper and GIF gallery built with HTML, CSS and JavaScript.

- **35 curated anime-related GIPHY embeds** with original uploader links: Jujutsu Kaisen, Demon Slayer, Bleach, Naruto, One Piece, Dragon Ball and Chainsaw Man.
- **13 downloadable creator-licensed illustrations**, including independent fan sketches of **Gojo** and **Naruto** alongside manga-inspired and fantasy artwork.
- Separate **All / GIFs / Images / Saved** tabs; searchable anime series, characters and creators; full-size preview modal; favorite wallpapers saved locally.
- **Report incorrect / meme GIF** action: opens a prefilled GitHub issue with the exact GIPHY ID and source. This helps us remove incorrect, captioned or unsuitable clips quickly.
- **Direct R2 image downloads** with a separate attachment URL, verified by the repository workflow.
- Fully responsive layout, lazy-loaded original GIPHY players and GitHub Pages hosting.

## No memes or mislabeling

A previously displayed Bleach GIF with a meme caption was removed after user feedback. The curated GIF catalog is now maintained in [data/anime-gifs.json](data/anime-gifs.json). GIF titles and source metadata are checked when being added. **Source tags do not guarantee a clip has no added text or memes**, so reports remain important. A GIPHY embed is a preview clip, not necessarily a seamless/full-HD desktop live wallpaper.

## Publishing media

GIF embeds: add a source-verified GIPHY ID, anime name, accurate title and original uploader in `data/anime-gifs.json`. The GIF itself remains on GIPHY. Do not upload the corresponding GIF file into R2 without the applicable permission.

Images and approved animated files: `data/wallpapers.json` contains creator credits, source pages, Creative Commons license and the original asset URL. The [Commons sync workflow](.github/workflows/sync-commons-r2.yml) checks the Commons API's current declared license and uploads allowed creator-licensed artwork to R2; [the manual publishing workflow](.github/workflows/publish-wallpaper.yml) supports other rights-cleared files.

Current R2 bucket is `animewallora-media`. Workflows use repository secrets `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and variable `R2_PUBLIC_URL`. Do not commit keys. The public `.r2.dev` development host is rate-limited and should be replaced with a custom domain before high-traffic production use.

## Credits, license, corrections

- Site source: MIT ([LICENSE](LICENSE)).
- Artwork and embedded clips: **separate copyright**, not included under the MIT software license. Respect the creator's attached license.
- Two licensed fan sketches show anime characters, but these are **independent fan artworks**, not studio-issued official key art. Attribution and a Creative Commons license on a fan drawing do not imply an endorsement from its anime franchise.
- GIPHY player embeds display third-party animated content without copying its bytes to R2.
- **MoeWalls and Wallper assets are not mirrored** unless the applicable rights holder permits redistribution; credit alone does not provide permission.
- To report a wrong GIF, meme, source mistake or rights concern, use the report link in the wallpaper preview or [open an issue](https://github.com/eliron8565/Wallpapers/issues/new).

The site can be served locally with `python -m http.server 8000`; opening `index.html` with `file://` may prevent JSON catalog loading.
