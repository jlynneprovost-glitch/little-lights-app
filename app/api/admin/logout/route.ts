import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/server/admin';
import { failure, sameOrigin } from '@/lib/server/http';

export async function POST(request: NextRequest) {
  try { sameOrigin(request); cookies().delete(ADMIN_COOKIE); return NextResponse.json({ authenticated: false }); }
  catch (error) { return failure(error); }
}
