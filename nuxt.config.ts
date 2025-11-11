// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@nuxtjs/supabase'],

  // Supabase module configuration (for environment variables)
  // For more details, see: https://supabase.com/docs/guides/getting-started/tutorials/with-nuxt-3
  // You need to set SUPABASE_URL and SUPABASE_KEY in your .env file.

  typescript: {
    typeCheck: false, // Use 'yarn typecheck' command instead
    strict: true
  }
})
