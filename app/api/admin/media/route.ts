import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin';
import { ApiError, failure } from '@/lib/server/http';
import { signedMedia } from '@/lib/server/stories';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    requireAdmin();
    const path = request.nextUrl.searchParams.get('path');
    if (!path?.startsWith('storage://little-lights-media/')) throw new ApiError(400, 'Invalid media path.');
    const url = await signedMedia(supabaseAdmin(), path);
    if (!url) throw new ApiError(404, 'That picture could not be found.');
    return NextResponse.redirect(url, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
