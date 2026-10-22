import { NextRequest, NextResponse } from 'next/server';
import { ApiError, appOrigin, failure, sameOrigin } from '@/lib/server/http';
import { requireUser, supabaseAdmin } from '@/lib/supabase/server';
import { stripeServer } from '@/lib/server/stripe';

export async function POST(request: NextRequest) {
  try {
    sameOrigin(request);
    const { user } = await requireUser();
    const { data, error } = await supabaseAdmin().from('users').select('stripe_customer_id').eq('id', user.id).single();
    if (error) throw error;
    if (!data.stripe_customer_id) throw new ApiError(409, 'There is no subscription to manage yet.');
    const portal = await stripeServer().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${appOrigin(request)}/parent` });
    return NextResponse.json({ url: portal.url });
  } catch (error) { return failure(error); }
}
