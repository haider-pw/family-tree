<script setup lang="ts">
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()

// Form state
const email = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)
const isDark = ref(false)

// Dark mode initialization
onMounted(() => {
  // Check system preference and localStorage
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = stored === 'dark' || (!stored && prefersDark)
  updateTheme()
})

function toggleDarkMode() {
  isDark.value = !isDark.value
  updateTheme()
}

function updateTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Handle password reset request
const handleForgotPassword = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    // Validate email
    if (!email.value || !email.value.includes('@')) {
      errorMsg.value = 'Please enter a valid email address'
      return
    }

    // Request password reset from Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      errorMsg.value = error.message
    } else {
      // Show success message (generic for security)
      successMsg.value = 'If an account exists with this email, you\'ll receive a password reset link shortly. Please check your inbox and spam folder.'
      // Clear email field
      email.value = ''
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-parchment dark:bg-forest-dark transition-colors duration-300">
    <!-- Dark Mode Toggle - Fixed Position -->
    <button
      @click="toggleDarkMode"
      class="fixed top-6 right-6 z-50 h-11 w-11 rounded-xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-heritage-green/20 dark:border-heritage-gold/20 hover:border-heritage-green/40 dark:hover:border-heritage-gold/40 transition-all duration-300 flex items-center justify-center group shadow-lg"
      aria-label="Toggle dark mode"
    >
      <svg v-if="!isDark" class="w-5 h-5 text-heritage-green transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <svg v-else class="w-5 h-5 text-heritage-gold transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>

    <div class="flex min-h-screen">
      <!-- Left Side - Brand Experience (Hidden on mobile) -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <!-- Gradient Overlay - Different variation for forgot password -->
        <div class="absolute inset-0 bg-gradient-to-br from-heritage-teal via-heritage-green to-heritage-green-dark dark:from-heritage-green-dark/90 dark:via-heritage-teal/80 dark:to-surface-dark z-10" />

        <!-- Geometric Pattern Background -->
        <div class="absolute inset-0 opacity-10 dark:opacity-5 z-0">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heritage-pattern-forgot" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0 L100 50 L50 100 L0 50 Z M50 25 L75 50 L50 75 L25 50 Z" fill="currentColor" class="text-white dark:text-heritage-gold" />
                <circle cx="50" cy="50" r="8" fill="currentColor" class="text-white dark:text-heritage-gold" />
                <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" stroke-width="1" class="text-white dark:text-heritage-gold" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heritage-pattern-forgot)" />
          </svg>
        </div>

        <!-- Content -->
        <div class="relative z-20 flex flex-col justify-between p-12 xl:p-16 text-white">
          <!-- Logo & Brand -->
          <div class="space-y-2">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-14 h-14 rounded-xl bg-white/20 dark:bg-heritage-gold/20 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-heritage-gold/30">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-serif font-bold">Shajra</h1>
                <p class="text-sm text-white/80 dark:text-white/70">Family Lineage</p>
              </div>
            </div>
          </div>

          <!-- Main Message -->
          <div class="space-y-6 max-w-md">
            <div class="space-y-4">
              <h2 class="text-4xl xl:text-5xl font-serif font-bold leading-tight">
                Restore Your Access
              </h2>
              <p class="text-lg text-white/90 dark:text-white/80 leading-relaxed">
                Enter your email address and we'll send you a secure link to reset your password and regain access to your family tree.
              </p>
            </div>

            <!-- Security Features -->
            <div class="space-y-4 pt-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 dark:bg-heritage-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1">Secure Process</h3>
                  <p class="text-sm text-white/80 dark:text-white/70">Password reset links expire after one hour for your protection</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 dark:bg-heritage-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1">Email Verification</h3>
                  <p class="text-sm text-white/80 dark:text-white/70">Check your inbox for the reset link (check spam folder too)</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 dark:bg-heritage-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1">Data Protection</h3>
                  <p class="text-sm text-white/80 dark:text-white/70">Your family data remains encrypted and secure</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Quote -->
          <div class="border-l-2 border-white/30 dark:border-heritage-gold/30 pl-4 py-2 max-w-md">
            <p class="text-sm italic text-white/90 dark:text-white/80">
              "Security is not just a feature; it's the foundation of trust"
            </p>
            <p class="text-xs text-white/70 dark:text-white/60 mt-1">
              — Your heritage is safe with us
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side - Forgot Password Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-md">
          <!-- Mobile Logo (visible only on mobile) -->
          <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-heritage-green to-heritage-teal dark:from-heritage-gold/80 dark:to-heritage-teal/80 flex items-center justify-center">
              <svg class="w-7 h-7 text-white dark:text-text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-serif font-bold text-text-primary-light dark:text-text-primary-dark">Shajra</h1>
              <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">Family Lineage</p>
            </div>
          </div>

          <!-- Form Card -->
          <div class="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl border border-heritage-green/10 dark:border-heritage-gold/10 shadow-2xl p-8 sm:p-10">
            <!-- Header -->
            <div class="mb-8">
              <div class="w-14 h-14 rounded-xl bg-heritage-green/10 dark:bg-heritage-gold/10 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-heritage-green dark:text-heritage-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 class="text-3xl font-serif font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                Forgot Password?
              </h2>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No worries, we'll send you reset instructions
              </p>
            </div>

            <!-- Success Message -->
            <div
              v-if="successMsg"
              class="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 flex items-start gap-3"
            >
              <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Email Sent</h4>
                <p class="text-sm text-green-700 dark:text-green-400">{{ successMsg }}</p>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMsg"
              class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 flex items-start gap-3 animate-shake"
            >
              <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Error</h4>
                <p class="text-sm text-red-700 dark:text-red-400">{{ errorMsg }}</p>
              </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleForgotPassword" class="space-y-6">
              <!-- Email Input -->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    v-model="email"
                    required
                    autocomplete="email"
                    placeholder="your.email@example.com"
                    :disabled="loading || !!successMsg"
                    class="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-forest-dark border border-heritage-green/20 dark:border-heritage-gold/20 rounded-xl text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-heritage-green dark:focus:ring-heritage-gold focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                </div>
                <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enter the email address associated with your account
                </p>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loading || !!successMsg"
                class="w-full py-3.5 rounded-xl font-semibold text-white dark:text-text-primary-light bg-gradient-to-r from-heritage-green to-heritage-teal dark:from-heritage-gold dark:to-heritage-gold-dark hover:shadow-lg hover:shadow-heritage-green/25 dark:hover:shadow-heritage-gold/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <svg v-else-if="!successMsg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{{ loading ? 'Sending reset link...' : successMsg ? 'Email sent' : 'Send Reset Link' }}</span>
                <svg v-if="!loading && !successMsg" class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            <!-- Back to Login Link -->
            <div class="mt-8 pt-6 border-t border-heritage-green/10 dark:border-heritage-gold/10">
              <NuxtLink
                to="/login"
                class="flex items-center justify-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-heritage-green dark:hover:text-heritage-gold transition-colors group"
              >
                <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span class="font-medium">Back to login</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Footer Info -->
          <p class="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark mt-6">
            Need help? Contact support at support@shajra.com
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom shake animation for error messages */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  @apply outline-none ring-2 ring-heritage-green dark:ring-heritage-gold ring-offset-2 ring-offset-parchment dark:ring-offset-forest-dark;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
