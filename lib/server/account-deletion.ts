import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { ApiError } from './http';

export type DeletionSteps = {
  cancelBilling: () => Promise<void>;
  removePictures: () => Promise<void>;
  removeAccount: () => Promise<void>;
};

// Billing is a prerequisite: an account must remain available when cancellation
// cannot be confirmed, so a parent can still manage the subscription.
export async function performAccountDeletion(steps: DeletionSteps) {
  try { await steps.cancelBilling(); }
  catch { throw new ApiError(502, 'We couldn’t confirm subscription cancellation. Your account is still here; please try again or manage your plan first.'); }
  try { await steps.removePictures(); }
  catch { throw new ApiError(502, 'Billing has been stopped, but we couldn’t remove every saved picture. Your account is still here. Please try deleting it again.'); }
  try { await steps.removeAccount(); }
  catch { throw new ApiError(502, 'Billing has been stopped, but account deletion couldn’t finish. Please try deleting your account again.'); }
}

export async function cancelAccountBilling(stripe: Stripe, customerId: string | null, subscriptionId: string | null) {
  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return;
    // Expire open checkout links before cancellation to prevent a stale checkout
    // from starting another subscription after the parent deletes the account.
    for await (const session of stripe.checkout.sessions.list({ customer: customerId, status: 'open', limit: 100 })) {
      await stripe.checkout.sessions.expire(session.id);
    }
    for await (const subscription of stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 })) {
      if (!['canceled', 'incomplete_expired'].includes(subscription.status)) await stripe.subscriptions.cancel(subscription.id);
    }
    // The customer was created exclusively for this app/account. Deleting it
    // also prevents new payment collection and removes retained payment methods.
    await stripe.customers.del(customerId);
  } else if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!['canceled', 'incomplete_expired'].includes(subscription.status)) await stripe.subscriptions.cancel(subscriptionId);
  }
}

export async function removeOwnedColorings(admin: SupabaseClient, userId: string) {
  const bucket = admin.storage.from('little-lights-coloring');
  const files: string[] = [];
  async function collect(prefix: string, depth: number) {
    if (depth > 5) throw new Error('Unexpected coloring folder structure');
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      for (const entry of data) {
        if (entry.name.includes('/') || entry.name === '..' || entry.name === '.') throw new Error('Invalid coloring path');
        const path = `${prefix}/${entry.name}`;
        if (entry.id) files.push(path); else await collect(path, depth + 1);
      }
      if (data.length < 100) break;
    }
  }
  await collect(userId, 0);
  for (let start = 0; start < files.length; start += 100) {
    const { error } = await bucket.remove(files.slice(start, start + 100));
    if (error) throw error;
  }
}
