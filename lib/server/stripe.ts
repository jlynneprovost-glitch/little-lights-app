import Stripe from 'stripe';
import { ApiError, requireEnv } from './http';
import { supabaseAdmin } from '@/lib/supabase/server';

export function stripeServer() {
  requireEnv('STRIPE_SECRET_KEY');
  if (!process.env.STRIPE_SECRET_KEY!.startsWith('sk_test_') && process.env.STRIPE_LIVE_MODE !== 'true') throw new ApiError(503, 'Use Stripe test keys, or explicitly enable live billing after reviewing the production setup.', false);
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function syncSubscription(customerId: string) {
  requireEnv('STRIPE_MONTHLY_PRICE_ID', 'STRIPE_YEARLY_PRICE_ID');
  const stripe = stripeServer();
  const admin = supabaseAdmin();
  const { data: profile, error } = await admin.from('users').select('id').eq('stripe_customer_id', customerId).maybeSingle();
  if (error) throw error;
  // A Stripe account can serve multiple products. Ignore unrelated customers.
  if (!profile) return;
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
  const relevant = subscriptions.data.filter(s => s.items.data.some(item => [process.env.STRIPE_MONTHLY_PRICE_ID, process.env.STRIPE_YEARLY_PRICE_ID].includes(item.price.id)));
  relevant.sort((a, b) => {
    const active = (s: Stripe.Subscription) => ['active', 'trialing'].includes(s.status) ? 1 : 0;
    return active(b) - active(a) || b.created - a.created;
  });
  const chosen = relevant[0];
  const { error: updateError } = await admin.from('users').update({ subscription_status: chosen?.status || 'free', stripe_subscription_id: chosen?.id || null }).eq('id', profile.id);
  if (updateError) throw updateError;
}
