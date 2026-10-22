import { NextRequest, NextResponse } from 'next/server';
import { appOrigin, failure } from '@/lib/server/http';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    if (code) {
      const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${appOrigin(request)}/parent?welcome=1`);
    }
    return NextResponse.redirect(`${appOrigin(request)}/parent?auth_error=expired`);
  } catch (error) { return failure(error); }
}
