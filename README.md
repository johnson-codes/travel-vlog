# Johnson Travels — travel vlog site

A simple static travel vlog site (HTML/CSS/JS, no build step), hosted on GitHub Pages.

## Add a vlog

Add an entry to `videos.json`:

```json
{
  "slug": "my-trip",            // used in the URL: #/v/my-trip
  "title": "My Trip",
  "country": "Canada",          // used for the filter chips
  "location": "Banff, AB",
  "date": "2026-10-01",
  "summary": "One-line teaser",
  "story": "Longer write-up shown under the video",
  "tags": ["hiking"],
  "youtube": "dQw4w9WgXcQ",     // 11-char YouTube ID (recommended), or…
  "file": "videos/my-trip.mp4", // …a local MP4 (< 100 MB) in /videos
  "thumbnail": "images/my-trip.jpg"
}
```

YouTube embeds are recommended: GitHub limits files to 100 MB and sites to about 1 GB.

## Run locally

```bash
python3 -m http.server 8000
```
