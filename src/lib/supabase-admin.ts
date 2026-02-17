import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client (uses service_role key, bypasses RLS)
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Getter that lazy-inits on first call (only in API routes at runtime)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
