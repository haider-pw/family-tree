<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      errorMsg.value = error.message;
    } else {
      router.push('/'); // Redirect to home page after successful login
    }
  } catch (error) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
      <h1 class="text-2xl font-bold text-center">Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="mt-4">
          <div>
            <label class="block" for="email">Email:</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div class="mt-4">
            <label class="block" for="password">Password:</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div class="flex items-baseline justify-between">
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
            >
              {{ loading ? 'Loading...' : 'Log In' }}
            </button>
            <NuxtLink to="/signup" class="text-sm text-blue-600 hover:underline">
              Don't have an account? Sign Up
            </NuxtLink>
          </div>
          <p v-if="errorMsg" class="text-red-500 text-sm mt-2">{{ errorMsg }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS is used, so minimal custom CSS is needed here */
</style>
