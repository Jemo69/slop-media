import { redirect } from '@sveltejs/kit';
import { PUBLIC_URL } from '$lib/r2';
export function GET({ params }) {
  const key = Buffer.from(params.id, 'base64url').toString();
  throw redirect(302, `${PUBLIC_URL()}/${key}`);
}
