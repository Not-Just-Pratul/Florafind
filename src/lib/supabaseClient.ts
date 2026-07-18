// Re-export createClient for convenience.
// All code should prefer calling createClient() directly rather than using
// the `supabase` singleton export below, to ensure a fresh client is used
// for each operation (important for PKCE OAuth flows).
export { createClient } from '@/utils/supabase/client';

import { createClient } from '@/utils/supabase/client';
export const supabase = createClient();
