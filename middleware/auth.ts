export default defineNuxtRouteMiddleware(async (to) => {
  // Skip public pages
  if (to.path === '/login' || to.path === '/signup') {
    return;
  }

  if (import.meta.server) {
    // SERVER-SIDE: Check authentication using server composables
    const user = useSupabaseUser();

    if (!user.value) {
      return navigateTo('/login');
    }
  } else {
    // CLIENT-SIDE: Wait for session to be restored from cookies
    const user = useSupabaseUser();
    const client = useSupabaseClient();

    // If user not immediately available, explicitly check session
    if (!user.value) {
      const { data } = await client.auth.getSession();
      if (!data.session) {
        return navigateTo('/login');
      }
    }
  }
});
