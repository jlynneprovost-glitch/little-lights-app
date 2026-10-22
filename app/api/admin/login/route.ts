import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, makeAdminSession, passwordMatches } from '@/lib/server/admin';
import { ApiError, body, clientKey, failure, rateLimit, sameOrigin } from '@/lib/server/http';

export async function POST(request: NextRequest) {
  try {
    sameOrigin(request);
    rateLimit(`admin:${clientKey(request)}`, 6, 15 * 60_000);
    rateLimit('admin:global', 50, 15 * 60_000);
    const { password } = await body<{ password: unknown }>(request, 2000);
    if (typeof password !== 'string' || password.length > 500 || !passwordMatches(password)) throw new ApiError(401, 'That password didn’t match. Please try again.');
    cookies().set(ADMIN_COOKIE, makeAdminSession(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 8 * 60 * 60 });
    return NextResponse.json({ authenticated: true });
  } catch (error) { return failure(error); }
}
