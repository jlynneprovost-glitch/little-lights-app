import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { ApiError, requireEnv } from '@/lib/server/http';

export function supabaseServer() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const jar = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values: { name: string; value: string; options: CookieOptions }[]) => { values.forEach(({ name, value, options }) => jar.set(name, value, { ...options, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })); },
    },
  });
}

export function supabaseAdmin() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function requireUser() {
  const supabase = supabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ApiError(401, 'Ask a grown-up to sign in first.');
  return { supabase, user };
}

export const hasSubscription = (status?: string | null) => status === 'active' || status === 'trialing';
