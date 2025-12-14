<template>
  <div class="bg-white rounded-xl shadow-xl p-6 mb-6 transform transition-transform hover:scale-105">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Your Corn Stats</h2>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-gray-600 text-sm mb-2">Total Corn Purchased</p>
        <p class="text-5xl font-bold text-amber-600 transition-all duration-300">{{ totalPurchases }}</p>
      </div>
      <div class="text-7xl animate-bounce">🌽</div>
    </div>
    <div v-if="lastPurchase" class="mt-4 text-sm text-gray-500">
      <span class="font-medium">Last purchase:</span> {{ lastPurchase }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  totalPurchases: number;
  lastPurchase: string | null;
}>();
</script>
