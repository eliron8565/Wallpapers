# Wallora — Wallpapers for every screen

A responsive, static wallpaper gallery built with HTML, CSS and JavaScript. No build tools, accounts, API keys, or backend required.

## Features
- 36 curated photography wallpapers displayed in a responsive image gallery
- Categories: Nature, Space, Ocean, City, Minimal, Flowers and Architecture
- Instant search, sorting and desktop/mobile orientation filtering
- Full-size wallpaper preview with a download button
- Favorites saved locally in the visitor's browser
- Dark/light theme, English/Hebrew languages with RTL layout
- Keyboard support: `/` to search, Escape to close previews
- Responsive for desktops, tablets and phones

## Publish with GitHub Pages
Go to repository **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose **main** and **/(root)**, and save. Your published site will normally be:

https://eliron8565.github.io/Wallpapers/

GitHub Pages must be enabled in repository settings; committing these files does not automatically confirm deployment.

## Add more images
Edit the `photos` array near the top of `app.js`. Each row follows:

`['Title','Category','landscape or portrait','photo-UNSPLASH-ID','search,tags','Description']`

Images are fetched from images.unsplash.com and require an internet connection. External image links can become unavailable; replace any unavailable image IDs with valid Unsplash photo IDs. For a production archive, consider hosting properly licensed images locally and tracking artist credits per image.

## License and image credits
Site source code: MIT License. Photos are hosted by Unsplash and remain subject to the [Unsplash License](https://unsplash.com/license). The repository does not own or redistribute the source photography. Credit photographers when adding or replacing images.

Created for the [Wallpapers GitHub repository](https://github.com/eliron8565/Wallpapers).
