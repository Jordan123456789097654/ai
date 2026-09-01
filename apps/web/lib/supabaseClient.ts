import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Build-time stub used when NEXT_PUBLIC_SUPABASE_URL is not set.
 * `next build` statically renders every page and imports this module
 * server-side — the real createClient() throws if the URL is empty.
 * The stub exposes just enough of the auth API surface to keep the
 * build from crashing; the browser always has the real env vars and
 * will get the real Supabase client.
 */
function makeBuildStub(): SupabaseClient {
  const noop = () => Promise.resolve({ data: { session: null, user: null }, error: null });
  return {
    auth: {
      getSession: noop,
      onAuthStateChange: (_event: unknown, _cb: unknown) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: noop,
      signInWithOtp: noop,
      signUp: noop,
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = url
  ? createClient(url, key)
  : makeBuildStub();

export async function getSessionToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
