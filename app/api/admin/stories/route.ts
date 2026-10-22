import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin';
import { body, failure, sameOrigin } from '@/lib/server/http';
import { toRow, toStory, validateStory } from '@/lib/server/stories';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    requireAdmin();
    const { data, error } = await supabaseAdmin().from('stories').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ stories: data.map(toStory) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}

async function save(request: NextRequest, editing: boolean) {
  try {
    sameOrigin(request); requireAdmin();
    const story = validateStory(await body(request));
    const client = supabaseAdmin();
    let query;
    if (editing) {
      if (!story.id) return NextResponse.json({ error: 'A story ID is required.' }, { status: 400 });
      query = client.from('stories').update(toRow(story)).eq('id', story.id).select().single();
    } else { query = client.from('stories').insert(toRow({ ...story, id: undefined })).select().single(); }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ story: toStory(data) }, { status: editing ? 200 : 201 });
  } catch (error) { return failure(error); }
}
export const POST = (request: NextRequest) => save(request, false);
export const PUT = (request: NextRequest) => save(request, true);
