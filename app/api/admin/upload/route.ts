import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/admin';
import { ApiError, failure, readBytes, sameOrigin } from '@/lib/server/http';
import { supabaseAdmin } from '@/lib/supabase/server';

const types: Record<string, { ext: string; max: number }> = {
  'image/png': { ext: 'png', max: 5_000_000 }, 'image/jpeg': { ext: 'jpg', max: 5_000_000 },
  'image/webp': { ext: 'webp', max: 5_000_000 }, 'audio/mpeg': { ext: 'mp3', max: 20_000_000 },
};

export async function POST(request: NextRequest) {
  try {
    sameOrigin(request); requireAdmin();
    if (Number(request.headers.get('content-length') || 0) > 21_000_000) throw new ApiError(413, 'Audio must be under 20 MB and pictures under 5 MB.');
    const contentType = request.headers.get('content-type');
    if (!contentType?.startsWith('multipart/form-data;')) throw new ApiError(400, 'Please upload a file using the content studio.');
    const bounded = new Response(new Uint8Array(await readBytes(request, 21_000_000)), { headers: { 'Content-Type': contentType } });
    const form = await bounded.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !types[file.type]) throw new ApiError(400, 'Choose a PNG, JPEG, WebP image or an MP3 audio file.');
    const type = types[file.type];
    if (!file.size || file.size > type.max) throw new ApiError(413, 'Audio must be under 20 MB and pictures under 5 MB.');
    const buffer = Buffer.from(await file.arrayBuffer());
    const valid = file.type === 'image/png' ? buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : file.type === 'image/jpeg' ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
      : file.type === 'image/webp' ? buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
      : buffer.toString('ascii', 0, 3) === 'ID3' || (buffer[0] === 255 && (buffer[1] & 224) === 224);
    if (!valid) throw new ApiError(400, 'That file does not match its selected format.');
    const path = `${file.type.startsWith('image') ? 'images' : 'audio'}/${randomUUID()}.${type.ext}`;
    const client = supabaseAdmin();
    const { error } = await client.storage.from('little-lights-media').upload(path, buffer, { contentType: file.type, cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data, error: signedError } = await client.storage.from('little-lights-media').createSignedUrl(path, 3600);
    if (signedError) throw signedError;
    return NextResponse.json({ url: `storage://little-lights-media/${path}`, previewUrl: data.signedUrl }, { status: 201 });
  } catch (error) { return failure(error); }
}
