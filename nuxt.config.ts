// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@nuxtjs/supabase', '@pinia/nuxt'],

  // Supabase module configuration
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
      exclude: ['/signup', '/login'], // Don't redirect these pages
    },
    types: '~/types/database.ts', // Point to our database types file
  },

  typescript: {
    typeCheck: false, // Use 'yarn typecheck' command instead
    strict: true
  }
})
