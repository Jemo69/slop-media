#!/usr/bin/env node
// slop-media CLI — zero deps (node 18+). Config via env: SLOP_MEDIA_URL, SLOP_MEDIA_TOKEN
const [cmd, ...rest] = process.argv.slice(2);
const BASE = (process.env.SLOP_MEDIA_URL || '').replace(/\/$/, '');
const TOKEN = process.env.SLOP_MEDIA_TOKEN || '';
const H = TOKEN ? { authorization: `Bearer ${TOKEN}` } : {};

function arg(name, d = '') {
  const i = rest.findIndex((a) => a === `--${name}`);
  if (i >= 0) return rest[i + 1] ?? d;
  const p = rest.find((a) => a.startsWith(`--${name}=`));
  return p ? p.split('=').slice(1).join('=') : d;
}
async function upload() {
  const file = rest.find((a) => !a.startsWith('--'));
  if (!file || !BASE) { console.error('usage: SLOP_MEDIA_URL=https://xxx.vercel.app slop-media upload demo.mp4 --pr 123 --repo owner/repo'); process.exit(1); }
  const { readFileSync, statSync } = await import('fs');
  const { basename } = await import('path');
  const pr = arg('pr', '0'), repo = arg('repo', '');
  const buf = readFileSync(file);
  const q = new URLSearchParams({ filename: basename(file), pr, repo });
  const r = await fetch(`${BASE}/api/upload?${q}`, { method: 'PUT', headers: { ...H, 'content-type': 'video/mp4' }, body: buf, duplex: 'half' });
  const j = await r.json();
  if (!r.ok) { console.error(j); process.exit(1); }
  console.log(`view: ${j.viewUrl}\nraw:  ${j.rawUrl}\n`);
  console.log(j.markdown);
}
async function list() {
  const pr = arg('pr', '');
  const r = await fetch(`${BASE}/api/list${pr ? `?pr=${pr}` : ''}`, { headers: H });
  if (r.status === 401) { console.error('unauthorized: check SLOP_MEDIA_TOKEN'); process.exit(1); }
  console.log(JSON.stringify(await r.json(), null, 2));
}
async function del() {
  const id = rest.find((a) => !a.startsWith('--'));
  const r = await fetch(`${BASE}/api/list`, { method: 'DELETE', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
  console.log(JSON.stringify(await r.json()));
}
if (cmd === 'upload') await upload();
else if (cmd === 'list') await list();
else if (cmd === 'delete') await del();
else if (cmd === 'stage') console.log('stage: preview locally, then run upload. No-op OK.');
else { console.error('cmds: upload|list|delete|stage'); process.exit(1); }
