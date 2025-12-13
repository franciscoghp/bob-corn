<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <h1 class="text-6xl font-bold text-amber-800 mb-4 animate-pulse">
          🌽 Bob's Corn
        </h1>
        <p class="text-xl text-amber-700 font-medium">
          Fresh corn, one at a time!
        </p>
      </header>

      <main class="max-w-2xl mx-auto">
        <!-- Stats Card -->
        <div class="bg-white rounded-xl shadow-xl p-6 mb-6 transform transition-transform hover:scale-105">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Your Corn Stats
          </h2>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-2">Total Corn Purchased</p>
              <p class="text-5xl font-bold text-amber-600 transition-all duration-300">
                {{ totalPurchases }}
              </p>
            </div>
            <div class="text-7xl animate-bounce">🌽</div>
          </div>
          <div v-if="lastPurchase" class="mt-4 text-sm text-gray-500">
            <span class="font-medium">Last purchase:</span> {{ formatDate(lastPurchase) }}
          </div>
        </div>

        <!-- Buy Button Card -->
        <div class="bg-white rounded-xl shadow-xl p-6 mb-6">
          <button
            @click="buyCorn"
            :disabled="isLoading || isRateLimited"
            :class="[
              'w-full py-5 px-6 rounded-lg font-semibold text-lg transition-all duration-200 relative overflow-hidden',
              isRateLimited
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isLoading
                ? 'bg-amber-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
            ]"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else-if="isRateLimited" class="flex items-center justify-center">
              <span class="mr-2">⏳</span>
              <span>Wait {{ countdown }}s before buying again</span>
            </span>
            <span v-else class="flex items-center justify-center">
              <span class="mr-2">🌽</span>
              Buy Corn
            </span>
          </button>
        </div>

        <!-- Message Display -->
        <transition name="fade">
          <div
            v-if="message"
            :class="[
              'rounded-lg p-4 mb-6 transition-all shadow-md',
              messageType === 'success'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : messageType === 'error'
                ? 'bg-red-100 text-red-800 border-2 border-red-300'
                : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
            ]"
          >
            <div class="flex items-center">
              <span class="mr-2 text-xl">
                {{ messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : 'ℹ️' }}
              </span>
              <span>{{ message }}</span>
            </div>
          </div>
        </transition>

        <!-- Rate Limit Info -->
        <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          <p class="font-semibold mb-2 text-base">📋 Fair Policy</p>
          <p>You can buy at most <strong>1 corn per minute</strong>. This ensures fair distribution to all customers!</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { buyCornAPI, getClientStatsAPI } from './services/api';

const totalPurchases = ref(0);
const lastPurchase = ref<string | null>(null);
const isLoading = ref(false);
const isRateLimited = ref(false);
const countdown = ref(60);
const message = ref('');
const messageType = ref<'success' | 'error' | 'info'>('info');
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// Generate or retrieve client ID (stored in localStorage)
const getClientId = (): string => {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

const startCountdown = (seconds: number = 60) => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdown.value = seconds;
  isRateLimited.value = true;
  
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      isRateLimited.value = false;
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }
  }, 1000);
};

const loadStats = async () => {
  try {
    const clientId = getClientId();
    const stats = await getClientStatsAPI(clientId);
    totalPurchases.value = stats.totalPurchases;
    lastPurchase.value = stats.lastPurchase;
    
    // Check if user should still be rate limited
    if (stats.lastPurchase) {
      const lastPurchaseTime = new Date(stats.lastPurchase).getTime();
      const timeSinceLastPurchase = Date.now() - lastPurchaseTime;
      const secondsRemaining = Math.ceil((60000 - timeSinceLastPurchase) / 1000);
      
      if (secondsRemaining > 0) {
        startCountdown(secondsRemaining);
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    showMessage('Failed to load statistics. Please refresh the page.', 'error');
  }
};

const buyCorn = async () => {
  if (isLoading.value || isRateLimited.value) return;

  isLoading.value = true;
  message.value = '';

  try {
    const clientId = getClientId();
    const response = await buyCornAPI(clientId);
    
    showMessage(response.message, 'success');
    totalPurchases.value += 1;
    lastPurchase.value = response.purchase.purchasedAt;
    
    // Start countdown after successful purchase
    startCountdown(60);

  } catch (error: any) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60;
      showMessage(
        error.response.data?.message || 'Too many requests. Please wait before trying again.',
        'error'
      );
      startCountdown(retryAfter);
    } else if (error.response?.status === 503) {
      showMessage('Service temporarily unavailable. Please try again in a moment.', 'error');
    } else {
      showMessage('Failed to buy corn. Please check your connection and try again.', 'error');
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadStats();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

