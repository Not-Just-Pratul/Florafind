import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // OAuth error from provider — send user back to login with message
  if (error) {
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  // PKCE flow: exchange code for session
  if (code) {
    const { createClient } = await import('@/utils/supabase/server');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  }

  // Implicit flow: tokens come back in the URL hash (#access_token=...).
  // The hash is not visible server-side, so redirect to a client-side
  // page that reads the hash and lets Supabase detect the session.
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
