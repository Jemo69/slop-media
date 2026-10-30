import { s3, BUCKET, PUBLIC_URL, requireToken } from '$lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { json } from '@sveltejs/kit';

async function store(buf: Buffer, filename: string, contentType: string, pr: string, repo: string, url: URL) {
  if (buf.length > 100 * 1024 * 1024) return json({ error: 'max 100MB' }, { status: 413 });
  const safe = (filename || 'upload.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `pr-${pr}/${Date.now()}-${safe}`;
  await s3().send(new PutObjectCommand({ Bucket: BUCKET(), Key: key, Body: buf, ContentType: contentType || 'video/mp4' }));
  const id = Buffer.from(key).toString('base64url');
  const origin = url.origin;
  const rawUrl = `${PUBLIC_URL()}/${key}`;
  const viewUrl = `${origin}/w/${id}`;
  const markdown = `<video src="${rawUrl}" width="100%" controls></video>`;
  return json({ id, key, rawUrl, viewUrl, markdown, pr, repo });
}

// PUT /api/upload?filename=x.mp4&pr=123&repo=o/r — raw binary body.
// (PUT avoids Vercel's cross-site form-POST firewall block.)
export async function PUT({ request, url }) {
  if (!requireToken(request)) return json({ error: 'unauthorized' }, { status: 401 });
  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length) return json({ error: 'empty body' }, { status: 400 });
  return store(buf, url.searchParams.get('filename') || 'upload.mp4', request.headers.get('content-type') || 'video/mp4', url.searchParams.get('pr') || '0', url.searchParams.get('repo') || '', url);
}

// POST multipart fallback (same-origin / browser use)
export async function POST({ request, url }) {
  if (!requireToken(request)) return json({ error: 'unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file) return json({ error: 'no file' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  return store(buf, file.name, file.type, (form.get('pr') as string) || '0', (form.get('repo') as string) || '', url);
}
