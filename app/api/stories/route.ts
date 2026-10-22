import { NextResponse } from 'next/server';
import { failure } from '@/lib/server/http';
import { supabaseAdmin } from '@/lib/supabase/server';
import { signedMedia, toStory } from '@/lib/server/stories';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const client = supabaseAdmin();
    const { data, error } = await client.from('stories').select('id,title,verse,description,theme,minutes,age_group,cover_scene,cover_image_url,is_free,status,created_at').eq('status', 'published').order('created_at');
    if (error) throw error;
    const stories = await Promise.all(data.map(async row => ({ ...toStory(row), coverImageUrl: await signedMedia(client, row.cover_image_url) })));
    return NextResponse.json({ stories }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
