import { NextRequest, NextResponse } from 'next/server';
import { ApiError, appOrigin, body, clientKey, failure, rateLimit, sameOrigin } from '@/lib/server/http';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    sameOrigin(request); rateLimit(`signin:${clientKey(request)}`, 5, 5 * 60_000);
    const input = await body<{ email: string; kidName?: string; kidAge?: number; bedtime?: string }>(request, 3000);
    if (typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new ApiError(400, 'Please enter a valid grown-up email.');
    const metadata: Record<string, string | number> = {};
    if (typeof input.kidName === 'string' && input.kidName.trim().length <= 40) metadata.kid_name = input.kidName.trim();
    if (Number.isInteger(input.kidAge) && input.kidAge! >= 3 && input.kidAge! <= 7) metadata.kid_age = input.kidAge!;
    if (typeof input.bedtime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(input.bedtime)) metadata.bedtime = input.bedtime;
    const { error } = await supabaseServer().auth.signInWithOtp({ email: input.email.trim().toLowerCase(), options: { emailRedirectTo: `${appOrigin(request)}/auth/callback`, data: metadata } });
    if (error) throw new ApiError(502, 'We couldn’t send the sign-in link. Please try again shortly.');
    return NextResponse.json({ sent: true, message: 'Check your inbox for a secure sign-in link.' });
  } catch (error) { return failure(error); }
}
