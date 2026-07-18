import { createClient } from '@/utils/supabase/client';

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { user: data.user, session: data.session, error };
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { user: data.user, session: data.session, error };
}

// Sign in with Google
// A fresh client is created every time so the PKCE code_verifier is written
// to localStorage by THIS instance — the same instance that will later read
// it back during the /auth/callback exchange.
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      skipBrowserRedirect: false,
    },
  });
  
  return { data, error };
}

// Sign out
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

// Get current session
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Password reset
export async function resetPassword(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
}

// Update user profile
export async function updateProfile(profile: { username?: string, avatar_url?: string, notifications?: boolean }) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: profile,
  });
  
  return { user, error };
} 