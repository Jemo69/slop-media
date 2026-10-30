import { PUBLIC_URL } from '$lib/r2';
import { env } from '$env/dynamic/private';
import { s3, BUCKET } from '$lib/r2';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function load({ url }) {
  // Grid is private: only key-holders (you) can browse everything.
  // Share-links /w/<id> stay public; raw R2 bytes must stay public for GitHub embeds.
  if (!env.GRID_KEY || url.searchParams.get('key') !== env.GRID_KEY) {
    return { items: [], locked: true };
  }
  const pr = url.searchParams.get('pr') ?? '';
  try {
    const out = await s3().send(new ListObjectsV2Command({ Bucket: BUCKET(), Prefix: pr ? `pr-${pr}/` : '', MaxKeys: 100 }));
    const items = (out.Contents ?? []).reverse().map((o) => {
      const key = o.Key!;
      const parts = key.split('/');
      const filename = parts.slice(1).join('/');
      const id = Buffer.from(key).toString('base64url');
      return { id, key, filename, pr: (parts[0] ?? '').replace('pr-', ''), repo: '', rawUrl: `${PUBLIC_URL()}/${key}` };
    });
    return { items, locked: false };
  } catch { return { items: [], locked: false }; }
}
