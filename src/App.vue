<script setup lang="ts">
import SystemHeader from '@/components/SystemHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => await authStore.init())
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <SystemHeader />
    <RouterView />
  </div>
</template>
