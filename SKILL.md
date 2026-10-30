# slop-media skill — put videos in PR bodies

Upload a screen recording, get back a `<video>` markdown line, paste it in the PR body. GitHub renders the player inline.

## Setup (env)
```
SLOP_MEDIA_URL=https://slop-media-jemo69s-projects.vercel.app
SLOP_MEDIA_TOKEN=<ask owner — same value as the app's UPLOAD_TOKEN>
```

Install once (private repo, needs access): `npm install -g github:Jemo69/slop-media`. Zero deps, node 18+. Then persist config so env vars aren't needed every call:
```bash
slop-media setup --url https://slop-media-jemo69s-projects.vercel.app --token <SLOP_MEDIA_TOKEN>
# stored in ~/.config/slop-media/config.json (mode 600). Env vars override it when set.

## Upload and embed in PR body
```bash
SLOP_MEDIA_URL=... SLOP_MEDIA_TOKEN=... slop-media upload demo.mp4 --pr 123 --repo owner/repo
# output ends with a <video> line — paste exactly that line into the PR body
```

Output gives three things:
- `view` — pretty watch page (`$SLOP_MEDIA_URL/w/<id>`)
- `raw` — mp4 bytes on R2 (public, free egress)
- a ready markdown line, e.g.
```html
<video src="https://pub-a14e3233c63f4fe79257ff018c886e81.r2.dev/pr-123/....mp4" width="100%" controls></video>
```

## List / delete / stage
```bash
slop-media list --pr 123
slop-media delete <id>
slop-media stage demo.mp4   # local check before uploading (no-op)
```

## Rules
- Prefer mp4 (H.264, e.g. `ffmpeg -pix_fmt yuv420p`). Max 100MB per file.
- Raw bytes serve from R2, never proxied through Vercel (saves bandwidth).
- Short redirect: `$SLOP_MEDIA_URL/v/<id>` → raw file.
- Auth: API (upload/list/delete) needs `SLOP_MEDIA_TOKEN` (Bearer). The home grid needs `?key=<GRID_KEY>` — ask the owner for both, they are siblings of the app's `UPLOAD_TOKEN`/`GRID_KEY` env. `/w/<id>` share-links stay public by design (safe to paste anywhere).
- Never print or commit tokens / R2 keys. They live in Vercel env + `web/.env` (gitignored).
