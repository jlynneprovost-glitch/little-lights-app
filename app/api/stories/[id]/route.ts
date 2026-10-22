import { NextResponse } from 'next/server';
import { ApiError, failure, UUID } from '@/lib/server/http';
import { hasSubscription, requireUser, supabaseAdmin } from '@/lib/supabase/server';
import { resolveStoryMedia, toStory } from '@/lib/server/stories';

export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (!UUID.test(params.id)) throw new ApiError(404, 'That adventure could not be found.');
    const admin = supabaseAdmin();
    const { data, error } = await admin.from('stories').select('*').eq('id', params.id).eq('status', 'published').maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, 'That adventure could not be found.');
    if (!data.is_free) {
      const { user } = await requireUser();
      const { data: profile, error: profileError } = await admin.from('users').select('subscription_status').eq('id', user.id).single();
      if (profileError) throw profileError;
      if (!hasSubscription(profile.subscription_status)) throw new ApiError(403, 'Ask a grown-up to unlock this adventure.');
    }
    return NextResponse.json({ story: await resolveStoryMedia(admin, toStory(data)) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return failure(error); }
}
