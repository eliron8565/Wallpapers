# ✦ AnimeWallora — Animated anime GIF wallpapers

[![Website smoke tests](https://github.com/eliron8565/Wallpapers/actions/workflows/test-site.yml/badge.svg)](https://github.com/eliron8565/Wallpapers/actions/workflows/test-site.yml)

**Website:** https://eliron8565.github.io/Wallpapers/

AnimeWallora is a free, English-language anime **GIF and live wallpaper viewing gallery**. It has been redesigned around *animation only*.

### Gallery

- **46 individually sourced anime GIFs** embedded through GIPHY, including Jujutsu Kaisen, Demon Slayer, Naruto, Bleach, One Piece, Dragon Ball, Chainsaw Man, Attack on Titan.
- No AI-generated or still images are included in the main gallery.
- Series/category filters, character/title search, featured picks, favorites saved in the browser, and immersive enlarged animation previews.
- Mobile-friendly dark UI, animated GIPHY hero and GIF-friendly layouts.
- Individual animations have a link to their GIPHY source and named uploading account.
- GitHub Actions smoke tests enforce animated-only design and data integrity.
- Future animated files that creators have licensed for redistribution can be displayed and downloaded from Cloudflare R2.

### Adding more GIFs

Verified on GIPHY? Add to [data/anime-gifs.json](data/anime-gifs.json):

```json
{
  "id": "giphy-GIPHY_ID",
  "title": "Example anime GIF",
  "series": "Demon Slayer",
  "character": "Tanjiro",
  "giphyId": "GIPHY_ID",
  "creator": "Creator's GIPHY username",
  "tags": ["tanjiro", "breathing"],
  "featured": false,
  "type": "giphy",
  "source": "https://giphy.com/gifs/GIPHY_ID"
}
```

**Please use real existing GIF IDs and accurate creator credits**. The on-site embed uses the GIPHY player. The video/GIF files are **not downloaded or rehosted**; the host embeds them for viewers.

### Downloadable looping wallpapers

The original `data/wallpapers.json` contains a previous, independently licensed **static art** archive that is **not shown** in the GIF-only gallery. For future rights-cleared GIF or MP4/WEBM contributions, the current site automatically includes records from that catalog when their media types and URLs identify them as animated media.

The existing [Publish licensed anime wallpaper to R2](.github/workflows/publish-wallpaper.yml) workflow can upload owner-approved media to Cloudflare R2 (requires configured repository secrets), and the site will show animated files with download controls.

Note that a GIF clip may not be a seamless 4K wallpaper. The gallery does not claim that each embed is 4K, and it does not grant download or redistribution rights to GIPHY content.

### Copyright and open source

**MIT** applies to site code only (see [LICENSE](LICENSE)). Copyright in anime shows, clips and GIFs belongs to the respective creators and rights holders. GIPHY is used via official embeds with source links; this project is not affiliated with GIPHY or the studios. Merely giving credit to MoeWalls, Wallper or GIPHY is not sufficient permission to mirror their media into R2. Any creator-permitted animated GIFs or video files added to R2 require evidence of permissions or an applicable open license.

To request correction or removal of an embed, create an issue with the source URL.
