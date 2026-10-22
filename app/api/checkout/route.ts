import { NextRequest, NextResponse } from 'next/server';
import { ApiError, appOrigin, body, failure, requireEnv, sameOrigin } from '@/lib/server/http';
import { requireUser, hasSubscription, supabaseAdmin } from '@/lib/supabase/server';
import { stripeServer } from '@/lib/server/stripe';

export async function POST(request: NextRequest) {
  try {
    sameOrigin(request);
    const { user } = await requireUser();
    const { plan } = await body<{ plan: 'monthly' | 'yearly' }>(request, 1000);
    if (!['monthly', 'yearly'].includes(plan)) throw new ApiError(400, 'Please choose a monthly or yearly plan.');
    requireEnv('STRIPE_MONTHLY_PRICE_ID', 'STRIPE_YEARLY_PRICE_ID');
    const stripe = stripeServer(); const admin = supabaseAdmin();
    const { data: profile, error } = await admin.from('users').select('stripe_customer_id,subscription_status,deletion_pending_at').eq('id', user.id).single();
    if (error) throw error;
    if (profile.deletion_pending_at) throw new ApiError(409, 'Account deletion is in progress. Please finish that before starting a plan.');
    if (hasSubscription(profile.subscription_status)) throw new ApiError(409, 'You already have an active plan. Manage it in the parent dashboard.');
    let customerId = profile.stripe_customer_id as string | null;
    if (!customerId) {
      // Retry-safe within an hour; a failed account deletion may have removed
      // an earlier customer, so verify the idempotent result before reusing it.
      let customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } }, { idempotencyKey: `little-lights-customer-${user.id}-${Math.floor(Date.now() / 3_600_000)}` });
      const existing = await stripe.customers.retrieve(customer.id);
      if (existing.deleted) customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = customer.id;
      const { error: updateError } = await admin.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
      if (updateError) throw updateError;
    }
    const origin = appOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', customer: customerId, client_reference_id: user.id,
      line_items: [{ price: plan === 'yearly' ? process.env.STRIPE_YEARLY_PRICE_ID! : process.env.STRIPE_MONTHLY_PRICE_ID!, quantity: 1 }],
      subscription_data: { metadata: { user_id: user.id } }, metadata: { user_id: user.id },
      allow_promotion_codes: true, success_url: `${origin}/parent?checkout=success`, cancel_url: `${origin}/paywall?checkout=cancelled`,
    });
    const { data: current, error: currentError } = await admin.from('users').select('deletion_pending_at').eq('id', user.id).maybeSingle();
    if (currentError || !current || current.deletion_pending_at) {
      await stripe.checkout.sessions.expire(session.id);
      throw new ApiError(409, 'Your account is being deleted. This checkout link has been closed.');
    }
    if (!session.url) throw new ApiError(502, 'Checkout is taking a little longer. Please try again.');
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) { return failure(error); }
}
