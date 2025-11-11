<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);

const handleSignup = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (error) {
      errorMsg.value = error.message;
    } else {
      successMsg.value = 'Registration successful! Please check your email to confirm your account.';
      // Optionally redirect to login page after a short delay
      // setTimeout(() => router.push('/login'), 3000);
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
      <h1 class="text-2xl font-bold text-center">Sign Up</h1>
      <form @submit.prevent="handleSignup">
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
              {{ loading ? 'Loading...' : 'Sign Up' }}
            </button>
            <NuxtLink to="/login" class="text-sm text-blue-600 hover:underline">
              Already have an account? Log In
            </NuxtLink>
          </div>
          <p v-if="errorMsg" class="text-red-500 text-sm mt-2">{{ errorMsg }}</p>
          <p v-if="successMsg" class="text-green-500 text-sm mt-2">{{ successMsg }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS is used, so minimal custom CSS is needed here */
</style>
