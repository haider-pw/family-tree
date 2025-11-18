<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">API Test Page</h1>

    <!-- Authentication Status -->
    <div class="bg-gray-100 p-4 rounded mb-6">
      <h2 class="text-xl font-semibold mb-2">Authentication Status</h2>
      <p v-if="user" class="text-green-600">
        ✅ Logged in as: {{ user.email }}
        <br>
        User ID: {{ user.id }}
      </p>
      <p v-else class="text-red-600">
        ❌ Not logged in
      </p>
      <div class="mt-4">
        <NuxtLink v-if="!user" to="/login" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Login
        </NuxtLink>
        <button v-else @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>

    <!-- API Test Section -->
    <div class="space-y-6">
      <!-- Test Family Trees API -->
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold mb-4">Test Family Trees API</h2>
        <button @click="testFamilyTreesAPI" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Test GET /api/family-trees
        </button>

        <div v-if="familyTreesResult" class="mt-4">
          <h3 class="font-semibold">Response:</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-x-auto">{{ familyTreesResult }}</pre>
        </div>
      </div>

      <!-- Create Family Tree -->
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold mb-4">Create Family Tree</h2>
        <input
          v-model="newTreeName"
          type="text"
          placeholder="Enter tree name"
          class="border px-3 py-2 rounded mr-2"
        >
        <button @click="createFamilyTree" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Tree
        </button>

        <div v-if="createResult" class="mt-4">
          <h3 class="font-semibold">Response:</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-x-auto">{{ createResult }}</pre>
        </div>
      </div>

      <!-- Test Health API -->
      <div class="border p-4 rounded">
        <h2 class="text-xl font-semibold mb-4">Test Health Check</h2>
        <button @click="testHealthAPI" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Test GET /api/health
        </button>

        <div v-if="healthResult" class="mt-4">
          <h3 class="font-semibold">Response:</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-x-auto">{{ healthResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Get the user from Supabase
const user = useSupabaseUser();
const supabase = useSupabaseClient();

// Results
const familyTreesResult = ref('');
const createResult = ref('');
const healthResult = ref('');
const newTreeName = ref('');

// Test Family Trees API
async function testFamilyTreesAPI() {
  try {
    const response = await $fetch('/api/family-trees');
    familyTreesResult.value = JSON.stringify(response, null, 2);
  } catch (error: any) {
    familyTreesResult.value = JSON.stringify({
      error: true,
      status: error.statusCode,
      message: error.statusMessage || error.message,
      details: error.data
    }, null, 2);
  }
}

// Create Family Tree
async function createFamilyTree() {
  if (!newTreeName.value) {
    createResult.value = JSON.stringify({ error: 'Please enter a tree name' }, null, 2);
    return;
  }

  try {
    const response = await $fetch('/api/family-trees', {
      method: 'POST',
      body: {
        name: newTreeName.value,
        description: 'Test tree created from API test page',
        is_default: false
      }
    });
    createResult.value = JSON.stringify(response, null, 2);
    newTreeName.value = '';
    // Refresh the family trees list
    await testFamilyTreesAPI();
  } catch (error: any) {
    createResult.value = JSON.stringify({
      error: true,
      status: error.statusCode,
      message: error.statusMessage || error.message,
      details: error.data
    }, null, 2);
  }
}

// Test Health API
async function testHealthAPI() {
  try {
    const response = await $fetch('/api/health');
    healthResult.value = JSON.stringify(response, null, 2);
  } catch (error: any) {
    healthResult.value = JSON.stringify({
      error: true,
      message: error.message
    }, null, 2);
  }
}

// Logout function
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    await navigateTo('/login');
  }
}
</script>