import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export const s3 = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY!, secretAccessKey: env.R2_SECRET_KEY! }
  });

export const BUCKET = () => env.R2_BUCKET!;
export const PUBLIC_URL = () => env.R2_PUBLIC_URL!.replace(/\/$/, ''); // e.g. https://media.you.workers.dev or R2 public bucket URL
export const requireToken = (req: Request) => {
  if (!env.UPLOAD_TOKEN) return true;
  return req.headers.get('authorization') === `Bearer ${env.UPLOAD_TOKEN}`;
};
