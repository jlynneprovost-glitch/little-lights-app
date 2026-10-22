import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { ApiError, requireEnv } from './http';

export const ADMIN_COOKIE = 'little-lights-admin';
export function adminConfigured() { return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12 && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32); }
function secret() {
  requireEnv('ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET');
  if (!adminConfigured()) throw new ApiError(503, 'Admin setup needs a password of at least 12 characters and a session secret of at least 32 characters.', false);
  return process.env.ADMIN_SESSION_SECRET!;
}
export function passwordMatches(value: string) {
  secret();
  return timingSafeEqual(createHash('sha256').update(value).digest(), createHash('sha256').update(process.env.ADMIN_PASSWORD!).digest());
}
export function makeAdminSession() {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + 8 * 60 * 60 * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`;
}
export function validAdminSession(token?: string) {
  if (!token || !adminConfigured()) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret()).update(payload).digest();
  const supplied = Buffer.from(signature, 'base64url');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try { return Number(JSON.parse(Buffer.from(payload, 'base64url').toString()).expires) > Date.now(); } catch { return false; }
}
export function requireAdmin() {
  secret();
  if (!validAdminSession(cookies().get(ADMIN_COOKIE)?.value)) throw new ApiError(401, 'Please sign in to the parent content studio.');
}
