# slop-media

Upload a screen recording or screenshot, get back a `<video>` / `<img>` markdown line to paste in PR bodies. GitHub renders both inline. Backend: Svelte viewer on Vercel + R2 storage (free egress).

Live app: https://slop-media-jemo69s-projects.vercel.app

## Install the CLI

```bash
# Zero deps, node 18+
npm install -g github:Jemo69/slop-media
```

Persist config so env vars aren't needed every call:

```bash
slop-media setup --url https://slop-media-jemo69s-projects.vercel.app --token <SLOP_MEDIA_TOKEN>
# stored in ~/.config/slop-media/config.json (mode 600). Env vars override it when set.
```

Get `<SLOP_MEDIA_TOKEN>` from the owner — same value as the app's `UPLOAD_TOKEN`.

## Upload and embed in a PR body

```bash
slop-media upload demo.mp4 --pr 123 --repo owner/repo
slop-media upload shot.png --pr 123 --repo owner/repo
# output ends with a <video> (mp4/webm/mov) or <img> (png/jpg/gif/webp/avif) line — paste exactly that line into the PR body
```

## List / delete / stage

```bash
slop-media list --pr 123
slop-media delete <id>
slop-media stage demo.mp4   # local type/size check before uploading
```

## Rules

- Videos: prefer mp4 (H.264, `ffmpeg -pix_fmt yuv420p`). Images: png/jpg/gif/webp/avif. Max 100MB per file.
- Raw bytes serve from R2, never proxied through Vercel (saves bandwidth).
- Auth: API (upload/list/delete) needs `SLOP_MEDIA_TOKEN` (Bearer). The home grid needs `?key=<GRID_KEY>` — ask the owner for both. `/w/<id>` share-links stay public by design.
- Never print or commit tokens / R2 keys. They live in Vercel env + `web/.env` (gitignored).

## Develop the web app

```bash
cd web
npm install
cp .env.example .env   # fill R2_* + UPLOAD_TOKEN, GRID_KEY
npm run dev
```

## Layout

- `cli/slop-media.js` — the CLI (zero deps)
- `web/` — Svelte viewer + API (`src/lib/r2.ts`, `src/routes/api/`, `src/routes/w/`)
- `SKILL.md` — agent skill (mirrored in [`Jemo69/skills`](https://github.com/Jemo69/skills))
