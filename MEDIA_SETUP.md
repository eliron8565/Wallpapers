# AnimeWallora media storage and automation

The site is English-first and open-source. Its website code may be open-source without implying any ownership over anime art shown in external embeds.

## Storage recommendation: Cloudflare R2

Cloudflare R2 is a good candidate for hosting large wallpaper files: it supports public buckets, custom domains, and S3-compatible programmatic uploads. You must create an R2 bucket and authorize its connection yourself. Free-tier usage is limited, and billing may apply above allowances.

1. Create a Cloudflare account and enable R2 in the Cloudflare dashboard.
2. Create a bucket called `animewallora-media`.
3. Connect a custom domain such as `media.your-domain.example` to serve public objects. (The `r2.dev` URL is for development use, not recommended for production.)
4. Create an R2 API token for uploading media. Never put API secrets in the repository or browser.
5. Upload **only media you own or have permission to redistribute** using the dashboard or an S3-compatible client.
6. Add an entry to `data/wallpapers.json`, commit, and the website will automatically render its preview and download link.

Example licensed entry (example only, not added to live catalog):

```json
{
  "title": "Creator-provided anime wallpaper",
  "url": "https://media.your-domain.example/approved-wallpaper.mp4",
  "thumbnail": "https://media.your-domain.example/approved-thumb.jpg",
  "creator": "Creator name",
  "license": "CC BY 4.0",
  "permission": "open-license",
  "source": "https://example.org/creator-source",
  "type": "video"
}
```

## Automation

The included GitHub Actions workflow checks the catalog automatically on every edit (and on demand) for complete records and a declared permission basis.

For auto-publishing eligible files, use an upload pipeline that ingests submissions with proof of license, checks media safety and metadata, uploads approved files to your R2 bucket, and updates `data/wallpapers.json`. You must provision a cloud storage bucket and supply credentials/permissions before a real uploader can run. No bulk download/scrape jobs from MoeWalls, Wallper or GIPHY are included because their media is not broadly licensed for mirroring.

## Sources and restrictions

- GIPHY API policy requires direct media serving and prohibits unauthorised caching/rehosting; on-page embeds are separate from rehosting files.
- Wallper's acceptable-use policy restricts redistributing its service content without prior consent.
- MoeWalls / MotionBGS images must be licensed by the relevant rights holder before rehosting; a source link or attribution does not itself grant reuse.
- An open-source code license does not apply to third-party artwork without its creators' permission.
