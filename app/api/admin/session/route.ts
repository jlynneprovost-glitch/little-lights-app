import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminConfigured, validAdminSession } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({ configured: adminConfigured(), authenticated: validAdminSession(cookies().get(ADMIN_COOKIE)?.value) }, { headers: { 'Cache-Control': 'no-store' } });
}
