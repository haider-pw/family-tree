<template>
  <div class="min-h-screen bg-parchment dark:bg-forest-dark transition-colors duration-300">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-heritage-green/10 dark:border-heritage-gold/10">
      <div class="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-heritage-green to-heritage-teal flex items-center justify-center">
            <svg class="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-serif font-bold text-text-primary-light dark:text-text-primary-dark">
              Shajra
            </h1>
            <p class="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark hidden sm:block">
              Family Lineage Chart
            </p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Dark Mode Toggle -->
          <button
            class="h-10 w-10 rounded-lg bg-white dark:bg-surface-dark border border-heritage-green/20 dark:border-heritage-gold/20 hover:border-heritage-green/40 dark:hover:border-heritage-gold/40 transition-colors flex items-center justify-center"
            aria-label="Toggle dark mode"
            @click="toggleDarkMode"
          >
            <svg v-if="!isDark" class="w-5 h-5 text-text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5 text-text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <template v-if="user">
            <span class="text-sm text-text-primary-light dark:text-text-primary-dark hidden md:block">{{ user.email }}</span>
            <button
              @click="handleLogout"
              class="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-medium text-sm"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="h-10 px-4 rounded-lg bg-heritage-green hover:bg-heritage-green-dark dark:bg-heritage-gold dark:hover:bg-heritage-gold-dark transition-colors flex items-center text-white dark:text-text-primary-light font-medium text-sm"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/signup"
              class="h-10 px-4 rounded-lg bg-heritage-teal hover:bg-heritage-teal-dark transition-colors hidden md:flex items-center text-white dark:text-text-primary-light font-medium text-sm"
            >
              Sign Up
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-16 md:pt-20 min-h-screen relative">
      <!-- Desktop: Floating Control Panel -->
      <div
        class="hidden md:block fixed left-8 top-28 z-40 w-80 transition-all duration-300"
        :class="{ '-translate-x-[calc(100%+4rem)]': !controlsVisible }"
      >
        <div class="bg-white/95 dark:bg-surface-dark/95 backdrop-blur-lg rounded-2xl border border-heritage-green/10 dark:border-heritage-gold/10 shadow-xl">
          <!-- Panel Header -->
          <div class="px-6 py-4 border-b border-heritage-green/10 dark:border-heritage-gold/10 flex items-center justify-between">
            <h2 class="text-lg font-serif font-semibold text-text-primary-light dark:text-text-primary-dark">
              Display Controls
            </h2>
            <button
              class="h-8 w-8 rounded-lg hover:bg-heritage-green/10 dark:hover:bg-heritage-gold/10 transition-colors flex items-center justify-center"
              aria-label="Close controls"
              @click="toggleControls"
            >
              <svg class="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Panel Content -->
          <div class="p-6 space-y-6">
            <!-- Ancestry Depth Control -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Ancestry Depth
                </span>
                <span class="text-sm font-mono font-bold text-heritage-green dark:text-heritage-gold bg-heritage-green/10 dark:bg-heritage-gold/10 px-2 py-1 rounded">
                  {{ ancestryDepth }}
                </span>
              </label>
              <input
                v-model.number="ancestryDepth"
                type="range"
                min="0"
                max="10"
                class="w-full h-2 bg-heritage-green/20 dark:bg-heritage-gold/20 rounded-lg appearance-none cursor-pointer accent-heritage-green dark:accent-heritage-gold"
                aria-label="Ancestry depth slider"
              >
              <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Number of ancestor generations to display
              </p>
            </div>

            <!-- Progeny Depth Control -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Progeny Depth
                </span>
                <span class="text-sm font-mono font-bold text-heritage-green dark:text-heritage-gold bg-heritage-green/10 dark:bg-heritage-gold/10 px-2 py-1 rounded">
                  {{ progenyDepth }}
                </span>
              </label>
              <input
                v-model.number="progenyDepth"
                type="range"
                min="0"
                max="10"
                class="w-full h-2 bg-heritage-green/20 dark:bg-heritage-gold/20 rounded-lg appearance-none cursor-pointer accent-heritage-green dark:accent-heritage-gold"
                aria-label="Progeny depth slider"
              >
              <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Number of descendant generations to display
              </p>
            </div>

            <!-- Divider -->
            <div class="border-t border-heritage-green/10 dark:border-heritage-gold/10"/>

            <!-- Legend -->
            <div class="space-y-2">
              <p class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">
                Legend
              </p>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-heritage-green"/>
                  <span class="text-sm text-text-primary-light dark:text-text-primary-dark">Male</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-heritage-gold"/>
                  <span class="text-sm text-text-primary-light dark:text-text-primary-dark">Female</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toggle Controls Button (Desktop - when panel is hidden) -->
      <button
        v-if="!controlsVisible"
        class="hidden md:flex fixed left-8 top-28 z-40 h-12 w-12 rounded-xl bg-heritage-green hover:bg-heritage-green-dark dark:bg-heritage-gold dark:hover:bg-heritage-gold-dark shadow-xl transition-all duration-300 items-center justify-center group"
        aria-label="Open controls"
        @click="toggleControls"
      >
        <svg class="w-6 h-6 text-white dark:text-text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <!-- Mobile: Bottom Sheet Controls -->
      <div
        class="md:hidden fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300"
        :class="{ 'translate-y-full': !controlsVisible }"
      >
        <div class="bg-white dark:bg-surface-dark rounded-t-3xl border-t border-heritage-green/10 dark:border-heritage-gold/10 shadow-2xl max-h-[70vh] overflow-y-auto">
          <!-- Drag handle -->
          <div class="pt-3 pb-2 flex justify-center">
            <div class="w-12 h-1 bg-text-secondary-light/30 dark:bg-text-secondary-dark/30 rounded-full"/>
          </div>

          <!-- Mobile control content -->
          <div class="px-6 pb-8 space-y-6">
            <h2 class="text-lg font-serif font-semibold text-text-primary-light dark:text-text-primary-dark">
              Display Controls
            </h2>

            <!-- Ancestry Depth Control -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Ancestry Depth
                </span>
                <span class="text-sm font-mono font-bold text-heritage-green dark:text-heritage-gold bg-heritage-green/10 dark:bg-heritage-gold/10 px-2 py-1 rounded">
                  {{ ancestryDepth }}
                </span>
              </label>
              <input
                v-model.number="ancestryDepth"
                type="range"
                min="0"
                max="10"
                class="w-full h-3 bg-heritage-green/20 dark:bg-heritage-gold/20 rounded-lg appearance-none cursor-pointer accent-heritage-green dark:accent-heritage-gold"
              >
              <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Number of ancestor generations to display
              </p>
            </div>

            <!-- Progeny Depth Control -->
            <div class="space-y-3">
              <label class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Progeny Depth
                </span>
                <span class="text-sm font-mono font-bold text-heritage-green dark:text-heritage-gold bg-heritage-green/10 dark:bg-heritage-gold/10 px-2 py-1 rounded">
                  {{ progenyDepth }}
                </span>
              </label>
              <input
                v-model.number="progenyDepth"
                type="range"
                min="0"
                max="10"
                class="w-full h-3 bg-heritage-green/20 dark:bg-heritage-gold/20 rounded-lg appearance-none cursor-pointer accent-heritage-green dark:accent-heritage-gold"
              >
              <p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Number of descendant generations to display
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile: Floating action button to open controls -->
      <button
        v-if="!controlsVisible"
        class="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-heritage-green dark:bg-heritage-gold shadow-2xl flex items-center gap-2 text-white dark:text-text-primary-light font-medium"
        @click="toggleControls"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Display Controls
      </button>

      <!-- Chart Container -->
      <div class="relative w-full" :style="{ height: 'calc(100vh - 4rem)' }">
        <!-- Loading State -->
        <div v-if="pending" class="absolute inset-0 flex items-center justify-center bg-parchment/50 dark:bg-forest-dark/50 backdrop-blur-sm z-30">
          <div class="text-center space-y-4">
            <div class="relative w-20 h-20 mx-auto">
              <div class="absolute inset-0 border-4 border-heritage-green/20 dark:border-heritage-gold/20 rounded-full"/>
              <div class="absolute inset-0 border-4 border-heritage-green dark:border-heritage-gold rounded-full border-t-transparent animate-spin"/>
            </div>
            <p class="text-lg font-serif text-text-primary-light dark:text-text-primary-dark">
              Loading family tree...
            </p>
            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Preparing your lineage visualization
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="absolute inset-0 flex items-center justify-center z-30">
          <div class="max-w-md mx-4 p-8 bg-white dark:bg-surface-dark rounded-2xl border border-red-200 dark:border-red-900/30 shadow-xl text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-xl font-serif font-semibold text-text-primary-light dark:text-text-primary-dark">
              Unable to Load Family Tree
            </h3>
            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {{ error.message }}
            </p>
            <button
              class="px-6 py-2 rounded-lg bg-heritage-green hover:bg-heritage-green-dark dark:bg-heritage-gold dark:hover:bg-heritage-gold-dark text-white dark:text-text-primary-light font-medium transition-colors"
              @click="() => refresh()"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!familyData || familyData.length === 0" class="absolute inset-0 flex items-center justify-center z-30">
          <div class="max-w-md mx-4 text-center space-y-4">
            <div class="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-heritage-green/10 to-heritage-teal/10 dark:from-heritage-gold/10 dark:to-heritage-teal/10 flex items-center justify-center">
              <svg class="w-12 h-12 text-heritage-green dark:text-heritage-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-serif font-semibold text-text-primary-light dark:text-text-primary-dark">
              No Family Data Yet
            </h3>
            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Start building your family tree by adding family members
            </p>
          </div>
        </div>

        <!-- Actual Chart Component -->
        <div v-else class="w-full h-full">
          <ShajraChart
            :family-data="familyData"
            :ancestry-depth="ancestryDepth"
            :progeny-depth="progenyDepth"
            class="w-full h-full"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useFamilyTreeStore } from '~/stores/familyTree'

definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const store = useFamilyTreeStore()

const title = 'Shajra - Family Lineage Tracker'
useHead({
  title
})

const ancestryDepth = ref(2)
const progenyDepth = ref(2)
const controlsVisible = ref(true)
const isDark = ref(false)

// Use store data instead of static API
const familyData = computed(() => store.chartData)
const pending = computed(() => store.loading)
const error = computed(() => store.error ? { message: store.error } : null)

// Initialize store on mount
onMounted(async () => {
  // Check system preference and localStorage
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = stored === 'dark' || (!stored && prefersDark)
  updateTheme()

  // Initialize family tree store
  await store.initialize()
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

function toggleControls() {
  controlsVisible.value = !controlsVisible.value
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear store on logout
    store.clearState()

    router.push('/login')
  } catch (error: any) {
    console.error('Error logging out:', error.message)
  }
}

// Function to refresh data
async function refresh() {
  if (store.activeTreeId) {
    await store.fetchTreeData(store.activeTreeId)
  }
}
</script>

<style>
/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible {
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
