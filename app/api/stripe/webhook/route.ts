import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError, failure, readText, requireEnv } from '@/lib/server/http';
import { stripeServer, syncSubscription } from '@/lib/server/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    requireEnv('STRIPE_WEBHOOK_SECRET');
    const signature = request.headers.get('stripe-signature');
    if (!signature) throw new ApiError(400, 'Missing Stripe signature.');
    if (Number(request.headers.get('content-length') || 0) > 1_000_000) throw new ApiError(413, 'Webhook payload too large.');
    const raw = await readText(request, 1_000_000);
    let event: Stripe.Event;
    try { event = stripeServer().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET!); }
    catch { throw new ApiError(400, 'Invalid Stripe signature.'); }
    const admin = supabaseAdmin();
    const { data: existing, error: lookupError } = await admin.from('stripe_events').select('id').eq('id', event.id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return NextResponse.json({ received: true, duplicate: true });
    if (['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.paid', 'invoice.payment_failed'].includes(event.type)) {
      const object = event.data.object as unknown as { customer?: string | { id: string } | null };
      const customerId = typeof object.customer === 'string' ? object.customer : object.customer?.id;
      if (customerId) await syncSubscription(customerId);
    }
    // Record only after successful synchronization. Retries remain safe if processing fails.
    const { error } = await admin.from('stripe_events').upsert({ id: event.id }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
    return NextResponse.json({ received: true });
  } catch (error) { return failure(error); }
}
