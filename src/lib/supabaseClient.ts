// Browser-side Supabase client — uses cookies via @supabase/ssr,
// compatible with Next.js 15 and the server-side helpers.
export { createClient } from '@/utils/supabase/client';

import { createClient } from '@/utils/supabase/client';
export const supabase = createClient();
