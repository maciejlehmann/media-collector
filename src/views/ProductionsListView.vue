<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useProductionsStore } from '@/stores/productionsStore'
import ProductionCard from '@/components/ProductionCard.vue'

const storeCollector = useProductionsStore()
onBeforeMount(async () => await Promise.allSettled([storeCollector.getProductions()]))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-800/50 to-gray-900/50 dark:from-gray-900 dark:to-black">
    <div class="p-8">
      <div class="text-center max-w-6xl mx-auto mb-16 pt-8">
        <h1 class="text-7xl font-black mb-6 tracking-tight" style="text-shadow: 0 0 20px rgba(0, 0, 0, 0.3)">
          <span
            class="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient"
          >
            Media Collector
          </span>
        </h1>
        <p class="text-2xl text-gray-300 dark:text-gray-400 font-medium tracking-wide">
          Kolekcjonuj wspomnienia ze spotkań z ulubionymi aktorami
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-6">
        <template v-if="storeCollector.productions.loading">
          <div v-for="n in 6" :key="n" class="w-64 m-4">
            <Card class="w-full">
              <template #header>
                <Skeleton height="24rem" />
              </template>
              <template #title>
                <Skeleton width="85%" height="1.5rem" />
              </template>
              <template #subtitle>
                <Skeleton width="90%" height="4rem" />
              </template>
            </Card>
          </div>
        </template>

        <ProductionCard
          v-else
          v-for="production in storeCollector.productions.list"
          :key="production.id"
          :production="production"
        />
      </div>
    </div>
  </div>
</template>

<style>
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradientShift 5s ease infinite;
}
</style>
