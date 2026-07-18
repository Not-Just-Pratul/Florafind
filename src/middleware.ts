import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the OAuth callback entirely — touching cookies here would destroy
  // the PKCE code_verifier before the browser client can exchange the code.
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // Skip Next.js internals and static asset routes — no auth needed and
  // processing them inflates response time for no benefit.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Refresh the session cookie for all other routes.
  // getSession() reads from cookies (no API call) so it's cheap.
  // The middleware util strips large sb- cookie chunks from the *request*
  // headers to prevent HTTP 431, while still writing refreshed cookies to
  // the *response* so they stay alive in the browser.
  const { supabase, supabaseResponse } = createClient(request);
  await supabase.auth.getSession();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match everything except static files handled by Next.js internals.
    // The pathname checks above handle further skipping.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
