import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient from @supabase/ssr automatically:
//  - Uses PKCE flow
//  - Stores the code_verifier in a cookie (NOT localStorage)
//  - Works correctly across the browser navigation to Google and back
//
// DO NOT add custom `auth` options here — especially flowType or storage
// overrides. They break the verifier storage and cause:
//   "PKCE code verifier not found in storage"
//   "OAuth state parameter missing"
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey);
};
