import { NextRequest, NextResponse } from 'next/server';
import { ApiError, failure, sameOrigin } from '@/lib/server/http';
import { supabaseServer } from '@/lib/supabase/server';
export async function POST(request: NextRequest) {
  try { sameOrigin(request); const { error } = await supabaseServer().auth.signOut(); if (error) throw new ApiError(502, 'We couldn’t sign you out. Please try again.'); return NextResponse.json({ signedOut: true }); }
  catch (error) { return failure(error); }
}
