# Login Redirect Fix Plan

## Problem
After logging in, the user is redirected back to the login page instead of the app dashboard.

## Root Cause
The issue is in `src/app/login/page.tsx` lines 22-47:

1. **Redundant `setSession()` call** - `signInWithPassword()` already handles session storage
2. **Client-side navigation with `router.push()`** - This doesn't wait for cookies to be properly set
3. **Race condition** - The app page checks for session before cookies are committed

## Solution

### File: `src/app/login/page.tsx`

Replace the `handleLogin` function (lines 22-47):

**Current code:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Wait for session to be stored before navigating
    if (data.session) {
      await supabase.auth.setSession(data.session);
    }

    router.push('/app');
    router.refresh();
  } catch (error: any) {
    setError(error.message || 'An error occurred during login');
  } finally {
    setLoading(false);
  }
};
```

**Fixed code:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Use window.location.href for full page reload
    // This ensures cookies are properly read on the next page load
    window.location.href = '/app';
  } catch (error: any) {
    setError(error.message || 'An error occurred during login');
  } finally {
    setLoading(false);
  }
};
```

### Key Changes:
1. **Remove `setSession()` call** - it's redundant and causes timing issues
2. **Remove `router.push()` and `router.refresh()`** - these don't guarantee cookies are set
3. **Use `window.location.href = '/app'`** - forces a full page reload, ensuring cookies are properly read

### Why This Works:
- `signInWithPassword()` already stores the session in cookies
- `window.location.href` triggers a full navigation (not client-side)
- The server-side middleware and `getSession()` call will properly read the cookies
- No race condition because the browser handles cookie synchronization

## Testing Steps:
1. Clear browser cookies/cache
2. Navigate to login page
3. Enter valid credentials
4. Click "Sign in"
5. Verify redirect to `/app` dashboard (not back to login)
6. Verify user session persists on page refresh
