// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false }, // Disabled to prevent SSR localStorage errors
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@nuxtjs/supabase', '@pinia/nuxt'],

  // Supabase module configuration
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
      exclude: ['/signup', '/login', '/forgot-password', '/reset-password'], // Don't redirect these pages
    },
    types: '~/types/database.ts', // Point to our database types file

    // Cookie options for session persistence (industry standard)
    // Note: useSsrCookies is TRUE by default, so session is automatically persisted in cookies
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax', // CSRF protection
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
    },

    // Explicitly enable cookie-based sessions (default: true)
    // This ensures session persists across page reloads
    useSsrCookies: true,
  },

  typescript: {
    typeCheck: false, // Use 'yarn typecheck' command instead
    strict: true
  }
})
