<template>
  <transition name="fade">
    <div v-if="message" :class="['rounded-lg p-4 mb-6 transition-all shadow-md', variantClass]">
      <div class="flex items-center">
        <span class="mr-2 text-xl">{{ icon }}</span>
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{
  message: string;
  messageType: 'success' | 'error' | 'info';
}>();

const variantClass = computed(() => {
  if (props.messageType === 'success') return 'bg-green-100 text-green-800 border-2 border-green-300';
  if (props.messageType === 'error') return 'bg-red-100 text-red-800 border-2 border-red-300';
  return 'bg-blue-100 text-blue-800 border-2 border-blue-300';
});

const icon = computed(() => (props.messageType === 'success' ? '✅' : props.messageType === 'error' ? '❌' : 'ℹ️'));
</script>
