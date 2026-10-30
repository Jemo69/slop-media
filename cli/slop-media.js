#!/usr/bin/env node
// slop-media CLI — zero deps (node 18+).
// Config: env SLOP_MEDIA_URL / SLOP_MEDIA_TOKEN, or `slop-media setup` (stored in ~/.config/slop-media/config.json, chmod 600).
import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'fs';
import { basename, join } from 'path';
import { homedir } from 'os';

const [cmd, ...rest] = process.argv.slice(2);
const CONF = join(homedir(), '.config', 'slop-media', 'config.json');
function saved() {
  try { return existsSync(CONF) ? JSON.parse(readFileSync(CONF, 'utf8')) : {}; }
  catch { return {}; }
}
const cfg = saved();
const BASE = (process.env.SLOP_MEDIA_URL || cfg.url || '').replace(/\/$/, '');
const TOKEN = process.env.SLOP_MEDIA_TOKEN || cfg.token || '';
const H = TOKEN ? { authorization: `Bearer ${TOKEN}` } : {};

function arg(name, d = '') {
  const i = rest.findIndex((a) => a === `--${name}`);
  if (i >= 0) return rest[i + 1] ?? d;
  const p = rest.find((a) => a.startsWith(`--${name}=`));
  return p ? p.split('=').slice(1).join('=') : d;
}
function needBase() {
  if (!BASE) {
    console.error('not configured. run:\n  slop-media setup --url https://slop-media-jemo69s-projects.vercel.app --token <SLOP_MEDIA_TOKEN>\nor set SLOP_MEDIA_URL + SLOP_MEDIA_TOKEN env.');
    process.exit(1);
  }
}
async function setup() {
  const url = (arg('url') || '').replace(/\/$/, '');
  const token = arg('token');
  if (!url || !token) { console.error('usage: slop-media setup --url <app-url> --token <token>'); process.exit(1); }
  mkdirSync(join(homedir(), '.config', 'slop-media'), { recursive: true });
  writeFileSync(CONF, JSON.stringify({ url, token }, null, 2));
  chmodSync(CONF, 0o600);
  console.log(`saved to ${CONF} (mode 600)`);
}
async function upload() {
  needBase();
  const file = rest.find((a) => !a.startsWith('--'));
  if (!file) { console.error('usage: slop-media upload demo.mp4 --pr 123 --repo owner/repo'); process.exit(1); }
  let buf;
  try { buf = readFileSync(file); } catch { console.error(`no such file: ${file}`); process.exit(1); }
  const pr = arg('pr', '0'), repo = arg('repo', '');
  const q = new URLSearchParams({ filename: basename(file), pr, repo });
  const r = await fetch(`${BASE}/api/upload?${q}`, { method: 'PUT', headers: { ...H, 'content-type': 'video/mp4' }, body: buf, duplex: 'half' });
  const j = await r.json();
  if (!r.ok) { console.error(r.status, j); process.exit(1); }
  console.log(`view: ${j.viewUrl}\nraw:  ${j.rawUrl}\n`);
  console.log(j.markdown);
}
async function list() {
  needBase();
  const pr = arg('pr', '');
  const r = await fetch(`${BASE}/api/list${pr ? `?pr=${pr}` : ''}`, { headers: H });
  if (r.status === 401) { console.error('unauthorized: run slop-media setup with a valid token'); process.exit(1); }
  console.log(JSON.stringify(await r.json(), null, 2));
}
async function del() {
  needBase();
  const id = rest.find((a) => !a.startsWith('--'));
  if (!id) { console.error('usage: slop-media delete <id>'); process.exit(1); }
  const r = await fetch(`${BASE}/api/list`, { method: 'DELETE', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
  const j = await r.json();
  if (!r.ok) { console.error(r.status, j); process.exit(1); }
  console.log(JSON.stringify(j));
}
if (cmd === 'setup') await setup();
else if (cmd === 'upload') await upload();
else if (cmd === 'list') await list();
else if (cmd === 'delete') await del();
else if (cmd === 'stage') console.log('stage: preview locally, then run upload. No-op OK.');
else { console.error('cmds: setup|upload|list|delete|stage'); process.exit(1); }
