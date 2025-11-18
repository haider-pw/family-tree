/**
 * Global middleware to ensure authentication state is properly synchronized
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server-side during initial load
  if (process.server) return;

  const user = useSupabaseUser();
  const supabase = useSupabaseClient();

  // Refresh session to ensure it's valid
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
      // Only log PII in development
      if (process.dev) {
        console.log('[Auth Middleware] Session valid for:', session.user?.email);
      } else {
        console.log('[Auth Middleware] Session valid');
      }
    } else {
      console.log('[Auth Middleware] No active session');
    }
  } catch (error) {
    console.error('[Auth Middleware] Error checking session:', error);
  }
});