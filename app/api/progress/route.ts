import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError, body, failure, sameOrigin, UUID } from '@/lib/server/http';
import { hasSubscription, requireUser, supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    sameOrigin(request);
    const { supabase, user } = await requireUser();
    const input = await body<{ storyId: string; coloringDataUrl?: string }>(request, 4_000_000);
    if (typeof input.storyId !== 'string' || !UUID.test(input.storyId)) throw new ApiError(400, 'Please choose a valid story.');
    const admin = supabaseAdmin();
    const { data: story, error: storyError } = await admin.from('stories').select('id,is_free,status').eq('id', input.storyId).maybeSingle();
    if (storyError) throw storyError;
    if (!story || story.status !== 'published') throw new ApiError(404, 'That story could not be found.');
    if (!story.is_free) {
      const { data: profile, error } = await supabase.from('users').select('subscription_status').eq('id', user.id).single();
      if (error) throw error;
      if (!hasSubscription(profile.subscription_status)) throw new ApiError(403, 'Ask a grown-up to unlock this adventure.');
    }
    let coloringUrl: string | null = null;
    let uploadedPath: string | null = null;
    if (input.coloringDataUrl) {
      if (typeof input.coloringDataUrl !== 'string' || !input.coloringDataUrl.startsWith('data:image/png;base64,')) throw new ApiError(400, 'Please save your coloring as a PNG picture.');
      const buffer = Buffer.from(input.coloringDataUrl.slice(22), 'base64');
      if (buffer.length > 2_500_000 || !buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new ApiError(400, 'That coloring picture is invalid or too large.');
      uploadedPath = `${user.id}/${input.storyId}/${randomUUID()}.png`;
      const { error } = await admin.storage.from('little-lights-coloring').upload(uploadedPath, buffer, { contentType: 'image/png', upsert: false });
      if (error) throw error;
      coloringUrl = `storage://little-lights-coloring/${uploadedPath}`;
    }
    const { data, error } = await supabase.rpc('complete_story', { p_story_id: input.storyId, p_coloring_url: coloringUrl });
    if (error) {
      if (uploadedPath) await admin.storage.from('little-lights-coloring').remove([uploadedPath]);
      throw error;
    }
    return NextResponse.json({ saved: true, completion: data });
  } catch (error) { return failure(error); }
}
