# chiyuenchung.com

Personal photography site — 35mm and medium-format film. Hosted on GitHub Pages.

## How publishing works

```
img/originals/   ← source scans, committed (1 file per photo, original quality)
img/photos.json  ← canonical metadata, hand-edited (one entry per published photo)
```

To publish a new photo:

1. Drop the scan into `img/originals/your-photo-name.jpg`.
2. Add a matching entry to `img/photos.json` (use `base: "your-photo-name"` — the filename without extension).
3. Commit and push.
4. The GitHub Action (`.github/workflows/deploy.yml`) resizes originals into 640/1280/2560 variants and deploys to GitHub Pages. Variants are never committed back to the repo.

A photo only appears on the site if it has an entry in `photos.json`. Drop a file into `img/originals/` without adding a JSON entry and it'll be archived in the repo but not displayed.

### photos.json shape

```json
{
  "base": "berlin-arrival",
  "title": "berlin, arrival",
  "alt": "evening light on cobblestones",
  "date": "2025-11-14",
  "taken": "2025-11-14",
  "camera": "Rollei 35",
  "lens": "Tessar 40mm f/3.5",
  "film": "Ilford HP5+",
  "location": "Berlin",
  "tags": ["berlin", "B&W"]
}
```

- `base` is required and must match the filename in `img/originals/` (without extension).
- `date`/`taken` drive the newest-first sort.
- `tags` containing `"fontana"` are excluded from the main gallery — they show up on `/fontana/` only.
- Everything else is optional; missing fields just don't render.

## Local preview

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

The site is fully static — no build step needed for local dev. To preview with the resized variants, you'd need to run the resize step manually (see the workflow for the ImageMagick command), but for layout/metadata changes the originals served via the placeholder paths work fine.

## Repo structure

```
index.html         main gallery
fontana/           private event gallery (Fontana, Dec 2025)
css/styles.css
js/                ES modules: state.js, gallery.js, lightbox.js, main.js
img/originals/     source scans (committed)
img/photos.json    canonical metadata (hand-edited)
.github/workflows/deploy.yml   build + deploy via GitHub Pages API
CNAME              chiyuenchung.com
```
