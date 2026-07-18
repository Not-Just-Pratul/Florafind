import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  // Build a clean set of request headers, stripping the large Supabase auth
  // cookie chunks that cause HTTP 431 "Request Header Fields Too Large".
  // The browser already has these cookies — we only need them on the response
  // to keep them refreshed, not echoed back in every request header.
  const requestHeaders = new Headers(request.headers);

  // Remove chunked sb- auth cookies from the request headers so they don't
  // inflate the header size. The Supabase server client will re-set them on
  // the response if they need refreshing.
  const cookieHeader = requestHeaders.get("cookie");
  if (cookieHeader) {
    const filtered = cookieHeader
      .split(";")
      .filter((c) => {
        const name = c.trim().split("=")[0];
        // Keep all cookies except Supabase auth token chunks
        return !name.startsWith("sb-") || name === "sb-provider-token";
      })
      .join(";");
    if (filtered.trim()) {
      requestHeaders.set("cookie", filtered);
    } else {
      requestHeaders.delete("cookie");
    }
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        // Read from the original request so Supabase can decode the session
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write refreshed cookies onto both the forwarded request and the
        // outgoing response so downstream Server Components can read them.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  return { supabase, supabaseResponse };
};
