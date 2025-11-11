// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint'],

  typescript: {
    typeCheck: false, // Use 'yarn typecheck' command instead
    strict: true
  }
})
