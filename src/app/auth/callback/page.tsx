"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * OAuth callback handler for PKCE flow.
 *
 * @supabase/ssr's createBrowserClient stores the code_verifier in a cookie
 * (not localStorage) so it survives the browser navigation to Google and back.
 *
 * When this page mounts, the client automatically detects the ?code= param,
 * exchanges it for a session using the stored cookie verifier, and fires an
 * onAuthStateChange event. We listen for SIGNED_IN and redirect to /dashboard.
 *
 * We also handle the case where Supabase returns an error in the URL params
 * (e.g. user denied access, or invalid OAuth state).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Provider returned an error before we got a code — send back to login
    if (errorParam) {
      console.error("OAuth provider error:", errorParam, errorDescription);
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("error", errorDescription || errorParam);
      router.replace(loginUrl.pathname + loginUrl.search);
      return;
    }

    // createBrowserClient detects the ?code= in the URL and automatically
    // calls exchangeCodeForSession using the cookie-stored code_verifier.
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          router.replace("/dashboard");
        } else if (event === "SIGNED_OUT") {
          subscription.unsubscribe();
          router.replace("/login");
        }
      }
    );

    // Fallback: if no auth event fires within 10 seconds, something went wrong
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace("/dashboard");
        } else {
          router.replace("/login?error=Authentication+timed+out");
        }
      });
    }, 10000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
