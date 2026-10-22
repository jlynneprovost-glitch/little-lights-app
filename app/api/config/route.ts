import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY), billingConfigured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_MONTHLY_PRICE_ID && process.env.STRIPE_YEARLY_PRICE_ID) }, { headers: { 'Cache-Control': 'no-store' } });
}
