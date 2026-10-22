import { NextRequest, NextResponse } from 'next/server';
import { ApiError, body, failure, sameOrigin } from '@/lib/server/http';
import { requireUser, supabaseAdmin } from '@/lib/supabase/server';
import { signedMedia } from '@/lib/server/stories';
import { stripeServer } from '@/lib/server/stripe';
import { cancelAccountBilling, performAccountDeletion, removeOwnedColorings } from '@/lib/server/account-deletion';

export const dynamic = 'force-dynamic';
type ProfileRow = { email: string | null; kid_name: string | null; kid_age: number | null; bedtime: string | null; subscription_status: string | null };
type ProgressRow = { story_id: string; completed_at: string; stars_earned: number; coloring_saved_url: string | null };
type StickerRow = { sticker_id: string; earned_at: string };
export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const results = await Promise.all([
      supabase.from('users').select('id,email,kid_name,kid_age,bedtime,subscription_status').eq('id', user.id).single(),
      supabase.from('progress').select('story_id,completed_at,stars_earned,coloring_saved_url').eq('user_id', user.id).order('completed_at', { ascending: false }),
      supabase.from('stickers').select('sticker_id,earned_at').eq('user_id', user.id).order('earned_at'),
    ]);
    for (const result of results) if (result.error) throw result.error;
    const profile = results[0].data as ProfileRow;
    const admin = supabaseAdmin();
    const progress = await Promise.all((results[1].data as ProgressRow[]).map(async row => ({ storyId: row.story_id, completedAt: row.completed_at, starsEarned: row.stars_earned, coloringDataUrl: await signedMedia(admin, row.coloring_saved_url) })));
    return NextResponse.json({ user: { id: user.id, email: profile.email || user.email, kidName: profile.kid_name || '', kidAge: profile.kid_age || 5, bedtime: profile.bedtime?.slice(0, 5) || '19:30', subscriptionStatus: profile.subscription_status || 'inactive' }, progress, stickers: (results[2].data as StickerRow[]).map(s => ({ stickerId: s.sticker_id, earnedAt: s.earned_at })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    sameOrigin(request);
    const { user } = await requireUser();
    const input = await body<{ kidName: string; kidAge: number; bedtime: string }>(request, 3000);
    if (typeof input.kidName !== 'string' || !input.kidName.trim() || input.kidName.trim().length > 40) throw new ApiError(400, 'Please enter a name of 1–40 characters.');
    if (!Number.isInteger(input.kidAge) || input.kidAge < 3 || input.kidAge > 7) throw new ApiError(400, 'Little Lights is made for ages 3–7.');
    if (typeof input.bedtime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.bedtime)) throw new ApiError(400, 'Please choose a valid bedtime.');
    const { error } = await supabaseAdmin().from('users').update({ kid_name: input.kidName.trim(), kid_age: input.kidAge, bedtime: input.bedtime }).eq('id', user.id);
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: NextRequest) {
  let unlock: (() => Promise<void>) | undefined;
  try {
    sameOrigin(request);
    const { supabase, user } = await requireUser();
    const admin = supabaseAdmin();
    const { data: profile, error } = await admin.from('users').select('stripe_customer_id,stripe_subscription_id').eq('id', user.id).single();
    if (error) throw error;
    const { error: lockError } = await admin.from('users').update({ deletion_pending_at: new Date().toISOString() }).eq('id', user.id);
    if (lockError) throw lockError;
    unlock = async () => { await admin.from('users').update({ deletion_pending_at: null }).eq('id', user.id); };
    await performAccountDeletion({
      cancelBilling: async () => {
        if (profile.stripe_customer_id || profile.stripe_subscription_id) {
          await cancelAccountBilling(stripeServer(), profile.stripe_customer_id, profile.stripe_subscription_id);
          const { error: clearError } = await admin.from('users').update({ stripe_customer_id: null, stripe_subscription_id: null, subscription_status: 'free' }).eq('id', user.id);
          if (clearError) throw clearError;
        }
      },
      removePictures: () => removeOwnedColorings(admin, user.id),
      removeAccount: async () => {
        const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
        if (deleteError) throw deleteError;
      },
    });
    unlock = undefined;
    // The user is already deleted; local scope clears this browser's cookies
    // without requiring a remote session revocation for a nonexistent account.
    await supabase.auth.signOut({ scope: 'local' });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (unlock) { try { await unlock(); } catch { /* Preserve the original failure; deletion can be retried. */ } }
    return failure(error);
  }
}
