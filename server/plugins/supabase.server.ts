/**
 * Server plugin to ensure Supabase authentication works properly
 * This helps with cookie-based session management
 */

import { serverSupabaseUser } from '#supabase/server';

export default defineNitroPlugin((nitroApp) => {
  // Log authentication status for debugging (only in development)
  if (process.dev) {
    nitroApp.hooks.hook('request', async (event) => {
      // Only log for API routes
      if (event.node.req.url?.startsWith('/api/')) {
        console.log(`[Auth Debug] Request to: ${event.node.req.url}`);

        // Try to get the user
        try {
          const user = await serverSupabaseUser(event);
          if (user) {
            console.log(`[Auth Debug] User found: ${user.email} (${user.id})`);
          } else {
            console.log('[Auth Debug] No user in session');
          }
        } catch (error) {
          console.log('[Auth Debug] Error checking user:', error);
        }
      }
    });
  }
});