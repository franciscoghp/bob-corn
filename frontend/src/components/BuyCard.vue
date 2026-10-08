<template>
  <div class="bg-white rounded-xl shadow-xl p-6 mb-6">
    <button
      @click="onBuy"
      :disabled="isLoading"
      :class="[
        'w-full py-5 px-6 rounded-lg font-semibold text-lg transition-all duration-200 relative overflow-hidden',
        isLoading
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
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  isLoading: boolean;
  isRateLimited: boolean;
  countdown: number;
}>();

const emit = defineEmits<{
  (e: 'buy'): void;
}>();

const onBuy = () => {
  emit('buy');
};
</script>
