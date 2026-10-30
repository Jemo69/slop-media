import { PUBLIC_URL } from '$lib/r2';
import { error } from '@sveltejs/kit';
export function load({ params }) {
  let key: string;
  try { key = Buffer.from(params.id, 'base64url').toString(); }
  catch { throw error(404, 'bad id'); }
  if (!key || key.includes('..')) throw error(404, 'not found');
  const filename = key.split('/').slice(1).join('/');
  return { key, filename, rawUrl: `${PUBLIC_URL()}/${key}` };
}
