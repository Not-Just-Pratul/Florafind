import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton browser client.
// Uses "implicit" flow so there is no PKCE code_verifier to lose between
// the OAuth redirect and the callback — eliminates the
// "code challenge does not match" error on localhost.
let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;
  client = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
};
