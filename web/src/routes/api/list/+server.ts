import { s3, BUCKET, PUBLIC_URL } from '$lib/r2';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const pr = url.searchParams.get('pr') ?? '';
  const out = await s3().send(new ListObjectsV2Command({ Bucket: BUCKET(), Prefix: pr ? `pr-${pr}/` : '', MaxKeys: 100 }));
  const items = (out.Contents ?? []).reverse().map((o) => {
    const key = o.Key!;
    return { id: Buffer.from(key).toString('base64url'), key, rawUrl: `${PUBLIC_URL()}/${key}`, size: o.Size };
  });
  return json({ items });
}

export async function DELETE({ request }) {
  const { id } = await request.json();
  const key = Buffer.from(id, 'base64url').toString();
  await s3().send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }));
  return json({ ok: true });
}
