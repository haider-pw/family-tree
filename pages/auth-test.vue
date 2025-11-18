<template>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-4">Authentication Debug Page</h1>

    <div class="space-y-4">
      <!-- Client-side user check -->
      <div class="border p-4 rounded">
        <h2 class="font-semibold mb-2">Client-side User (useSupabaseUser):</h2>
        <pre class="bg-gray-100 p-2 rounded">{{ clientUser || 'No user' }}</pre>
      </div>

      <!-- Session check -->
      <div class="border p-4 rounded">
        <h2 class="font-semibold mb-2">Session Check:</h2>
        <button @click="checkSession" class="bg-blue-500 text-white px-4 py-2 rounded">
          Check Session
        </button>
        <pre v-if="sessionInfo" class="bg-gray-100 p-2 rounded mt-2">{{ sessionInfo }}</pre>
      </div>

      <!-- Manual API test -->
      <div class="border p-4 rounded">
        <h2 class="font-semibold mb-2">Manual API Test:</h2>
        <button @click="testAPI" class="bg-green-500 text-white px-4 py-2 rounded">
          Test /api/family-trees
        </button>
        <pre v-if="apiResult" class="bg-gray-100 p-2 rounded mt-2">{{ apiResult }}</pre>
      </div>

      <!-- Force refresh session -->
      <div class="border p-4 rounded">
        <h2 class="font-semibold mb-2">Force Refresh Session:</h2>
        <button @click="refreshSession" class="bg-purple-500 text-white px-4 py-2 rounded">
          Refresh Session
        </button>
        <pre v-if="refreshResult" class="bg-gray-100 p-2 rounded mt-2">{{ refreshResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const clientUser = useSupabaseUser();
const supabase = useSupabaseClient();

const sessionInfo = ref('');
const apiResult = ref('');
const refreshResult = ref('');

async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      sessionInfo.value = JSON.stringify({ error: error.message }, null, 2);
    } else if (session) {
      sessionInfo.value = JSON.stringify({
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        access_token: session.access_token ? 'Present' : 'Missing',
        refresh_token: session.refresh_token ? 'Present' : 'Missing',
        expires_at: session.expires_at,
      }, null, 2);
    } else {
      sessionInfo.value = 'No session found';
    }
  } catch (err: any) {
    sessionInfo.value = JSON.stringify({ error: err.message }, null, 2);
  }
}

async function testAPI() {
  try {
    // Test with credentials explicitly included
    const response = await fetch('/api/family-trees', {
      method: 'GET',
      credentials: 'include', // Explicitly include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    apiResult.value = JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      data: data,
    }, null, 2);
  } catch (err: any) {
    apiResult.value = JSON.stringify({ error: err.message }, null, 2);
  }
}

async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      refreshResult.value = JSON.stringify({ error: error.message }, null, 2);
    } else if (session) {
      refreshResult.value = JSON.stringify({
        success: true,
        user: session.user.email,
        expires_at: session.expires_at,
      }, null, 2);
    } else {
      refreshResult.value = 'No session to refresh';
    }
  } catch (err: any) {
    refreshResult.value = JSON.stringify({ error: err.message }, null, 2);
  }
}
</script>