<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

// Form state
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)
const isDark = ref(false)
const tokenError = ref(false)

// Dark mode initialization
onMounted(() => {
  // Check system preference and localStorage
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = stored === 'dark' || (!stored && prefersDark)
  updateTheme()

  // Check if we have a valid token/hash in the URL
  const hash = window.location.hash
  if (!hash || (!hash.includes('access_token') && !hash.includes('type=recovery'))) {
    tokenError.value = true
    errorMsg.value = 'Invalid or expired password reset link. Please request a new one.'
  }
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

// Password strength calculation
const passwordStrength = computed(() => {
  if (!password.value) return { level: 0, label: '', color: '' }

  let strength = 0
  const pass = password.value

  // Length check
  if (pass.length >= 8) strength += 25
  if (pass.length >= 12) strength += 15

  // Character variety
  if (/[a-z]/.test(pass)) strength += 15
  if (/[A-Z]/.test(pass)) strength += 15
  if (/[0-9]/.test(pass)) strength += 15
  if (/[^a-zA-Z0-9]/.test(pass)) strength += 15

  if (strength <= 30) {
    return { level: strength, label: 'Weak', color: 'bg-red-500 dark:bg-red-600' }
  } else if (strength <= 60) {
    return { level: strength, label: 'Fair', color: 'bg-orange-500 dark:bg-orange-600' }
  } else if (strength <= 80) {
    return { level: strength, label: 'Good', color: 'bg-yellow-500 dark:bg-yellow-600' }
  } else {
    return { level: strength, label: 'Strong', color: 'bg-green-500 dark:bg-green-600' }
  }
})

// Password match validation
const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true
  return password.value === confirmPassword.value
})

// Handle password reset
const handleResetPassword = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    // Validation
    if (password.value !== confirmPassword.value) {
      errorMsg.value = 'Passwords do not match'
      return
    }

    if (password.value.length < 8) {
      errorMsg.value = 'Password must be at least 8 characters long'
      return
    }

    // Additional password strength validation
    if (passwordStrength.value.label === 'Weak') {
      errorMsg.value = 'Please choose a stronger password for better security'
      return
    }

    // Update password using Supabase
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) {
      errorMsg.value = error.message
    } else {
      successMsg.value = 'Password updated successfully! Redirecting to login...'

      // Clear form
      password.value = ''
      confirmPassword.value = ''

      // Sign out to ensure clean state
      await supabase.auth.signOut()

      // Redirect to login after 2 seconds
      setTimeout(() => router.push('/login'), 2000)
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
        <!-- Gradient Overlay - Different variation for reset password -->
        <div class="absolute inset-0 bg-gradient-to-br from-heritage-green-dark via-heritage-teal to-heritage-green dark:from-surface-dark dark:via-heritage-green-dark/90 dark:to-heritage-gold/60 z-10" />

        <!-- Geometric Pattern Background -->
        <div class="absolute inset-0 opacity-10 dark:opacity-5 z-0">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heritage-pattern-reset" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0 L100 50 L50 100 L0 50 Z M50 25 L75 50 L50 75 L25 50 Z" fill="currentColor" class="text-white dark:text-heritage-gold" />
                <circle cx="50" cy="50" r="8" fill="currentColor" class="text-white dark:text-heritage-gold" />
                <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" stroke-width="1" class="text-white dark:text-heritage-gold" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heritage-pattern-reset)" />
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
                Create a Strong Password
              </h2>
              <p class="text-lg text-white/90 dark:text-white/80 leading-relaxed">
                Choose a secure password to protect your family's precious lineage data. Your heritage deserves the strongest protection.
              </p>
            </div>

            <!-- Security Tips -->
            <div class="space-y-4 pt-4">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-white/80 dark:text-white/70">Password Security Tips</h3>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 dark:bg-heritage-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1">Minimum 8 characters</h3>
                  <p class="text-sm text-white/80 dark:text-white/70">Longer passwords are more secure</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 dark:bg-heritage-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1">Mix character types</h3>
                  <p class="text-sm text-white/80 dark:text-white/70">Use uppercase, lowercase, numbers, and symbols</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-white/20 dark:bg-heritage-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold mb-1">Avoid common words</h3>
                  <p class="text-sm text-white/80 dark:text-white/70">Don't use dictionary words or personal info</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Quote -->
          <div class="border-l-2 border-white/30 dark:border-heritage-gold/30 pl-4 py-2 max-w-md">
            <p class="text-sm italic text-white/90 dark:text-white/80">
              "A strong password is the key to safeguarding generations of heritage"
            </p>
            <p class="text-xs text-white/70 dark:text-white/60 mt-1">
              — Protect what matters most
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side - Reset Password Form -->
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 class="text-3xl font-serif font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                Set New Password
              </h2>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Create a strong password to secure your account
              </p>
            </div>

            <!-- Token Error Message -->
            <div
              v-if="tokenError"
              class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 flex items-start gap-3"
            >
              <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Invalid Link</h4>
                <p class="text-sm text-red-700 dark:text-red-400 mb-3">{{ errorMsg }}</p>
                <NuxtLink
                  to="/forgot-password"
                  class="inline-flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                  Request new reset link
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </NuxtLink>
              </div>
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
                <h4 class="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Success!</h4>
                <p class="text-sm text-green-700 dark:text-green-400">{{ successMsg }}</p>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMsg && !tokenError"
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
            <form v-if="!tokenError" @submit.prevent="handleResetPassword" class="space-y-5">
              <!-- New Password Input -->
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  New Password
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    required
                    autocomplete="new-password"
                    placeholder="Create a strong password"
                    :disabled="loading || !!successMsg"
                    class="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-forest-dark border border-heritage-green/20 dark:border-heritage-gold/20 rounded-xl text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-heritage-green dark:focus:ring-heritage-gold focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-heritage-green dark:hover:text-heritage-gold transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>

                <!-- Password Strength Indicator -->
                <div v-if="password" class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-text-secondary-light dark:text-text-secondary-dark">Password strength:</span>
                    <span class="font-medium" :class="[
                      passwordStrength.label === 'Weak' ? 'text-red-600 dark:text-red-400' : '',
                      passwordStrength.label === 'Fair' ? 'text-orange-600 dark:text-orange-400' : '',
                      passwordStrength.label === 'Good' ? 'text-yellow-600 dark:text-yellow-400' : '',
                      passwordStrength.label === 'Strong' ? 'text-green-600 dark:text-green-400' : ''
                    ]">
                      {{ passwordStrength.label }}
                    </span>
                  </div>
                  <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full transition-all duration-300 rounded-full"
                      :class="passwordStrength.color"
                      :style="{ width: `${passwordStrength.level}%` }"
                    />
                  </div>
                </div>
              </div>

              <!-- Confirm Password Input -->
              <div class="space-y-2">
                <label for="confirmPassword" class="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Confirm New Password
                </label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    required
                    autocomplete="new-password"
                    placeholder="Re-enter your password"
                    :disabled="loading || !!successMsg"
                    class="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-forest-dark border rounded-xl text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    :class="[
                      !confirmPassword || passwordsMatch
                        ? 'border-heritage-green/20 dark:border-heritage-gold/20 focus:ring-heritage-green dark:focus:ring-heritage-gold focus:border-transparent'
                        : 'border-red-300 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-400'
                    ]"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-heritage-green dark:hover:text-heritage-gold transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <p v-if="confirmPassword && !passwordsMatch" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Passwords do not match
                </p>
              </div>

              <!-- Security Notice -->
              <div class="p-3 rounded-lg bg-heritage-green/5 dark:bg-heritage-gold/5 border border-heritage-green/10 dark:border-heritage-gold/10">
                <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-start gap-2">
                  <svg class="w-4 h-4 flex-shrink-0 mt-0.5 text-heritage-green dark:text-heritage-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>After resetting your password, you'll be signed out and need to log in again with your new password.</span>
                </p>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loading || !passwordsMatch || !!successMsg"
                class="w-full py-3.5 rounded-xl font-semibold text-white dark:text-text-primary-light bg-gradient-to-r from-heritage-green to-heritage-teal dark:from-heritage-gold dark:to-heritage-gold-dark hover:shadow-lg hover:shadow-heritage-green/25 dark:hover:shadow-heritage-gold/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{{ loading ? 'Updating password...' : 'Reset Password' }}</span>
                <svg v-if="!loading" class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
