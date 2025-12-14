<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
    <div class="container mx-auto px-4 py-8">
      <Header />

      <main class="max-w-2xl mx-auto">
        <StatsCard :totalPurchases="totalPurchases" :lastPurchase="lastPurchase ? formatDate(lastPurchase) : null" />

        <BuyCard
          :isLoading="isLoading"
          :isRateLimited="isRateLimited"
          :countdown="countdown"
          @buy="buyCorn"
        />

        <MessageBox :message="message" :messageType="messageType" />

        <RateLimitInfo />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { buyCornAPI, getClientStatsAPI } from './services/api';

import Header from './components/Header.vue';
import StatsCard from './components/StatsCard.vue';
import BuyCard from './components/BuyCard.vue';
import MessageBox from './components/MessageBox.vue';
import RateLimitInfo from './components/RateLimitInfo.vue';

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
      const secondsRemaining = Math.min(60, Math.max(0, Math.ceil((60000 - timeSinceLastPurchase) / 1000)));

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
  if (isLoading.value) return;

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
      const serverMsg = error.response.data?.message || 'Too many requests. Please wait before trying again.';
      showMessage(`${serverMsg} Try again in ${retryAfter}s.`, 'error');
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

