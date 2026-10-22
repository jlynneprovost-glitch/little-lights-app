import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, message: string, public configured = true) { super(message); }
}

export function failure(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message, configured: error.configured }, { status: error.status });
  console.error('[Little Lights API]', error instanceof Error ? error.message : 'Unexpected server error');
  return NextResponse.json({ error: "Oops! We couldn't finish that. Please try again." }, { status: 500 });
}

export function requireEnv(...names: string[]) {
  for (const name of names) if (!process.env[name]) throw new ApiError(503, 'This feature is not connected yet. A grown-up can finish the service setup.', false);
}

export function appOrigin(request?: NextRequest) {
  const value = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV !== 'production' && request ? request.nextUrl.origin : undefined);
  if (!value) throw new ApiError(503, 'Set NEXT_PUBLIC_APP_URL before using accounts or billing.', false);
  const url = new URL(value);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new ApiError(503, 'The production app URL must use HTTPS.', false);
  return url.origin;
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== appOrigin(request)) throw new ApiError(403, 'Please open this action from Little Lights.');
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') throw new ApiError(403, 'Please open this action from Little Lights.');
}

export async function readBytes(request: Request, limit = 100_000): Promise<Buffer> {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new ApiError(413, 'That upload is too large.');
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new ApiError(413, 'That request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function readText(request: Request, limit = 100_000): Promise<string> { return (await readBytes(request, limit)).toString('utf8'); }

export async function body<T = Record<string, unknown>>(request: Request, limit = 100_000): Promise<T> {
  const text = await readText(request, limit);
  try { const value = JSON.parse(text); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value as T; }
  catch { throw new ApiError(400, 'Please send a valid request.'); }
}

const attempts = new Map<string, { count: number; expires: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (attempts.size >= 5000) {
    for (const [k, v] of attempts) if (v.expires < now) attempts.delete(k);
    if (attempts.size >= 5000 && !attempts.has(key)) throw new ApiError(429, 'A little pause, please. Try again in a few minutes.');
  }
  const entry = attempts.get(key);
  if (!entry || entry.expires <= now) { attempts.set(key, { count: 1, expires: now + windowMs }); return; }
  entry.count++;
  if (entry.count > max) throw new ApiError(429, 'A little pause, please. Try again in a few minutes.');
}

export function clientKey(request: NextRequest) { return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'; }
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
