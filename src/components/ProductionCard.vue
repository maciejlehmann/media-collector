<script setup lang="ts">
import type { Production } from '@/types/productions'

defineProps<{ production: Production }>()

const typeTranslations: Record<Production['type'], string> = {
  series: 'Serial',
  movie: 'Film',
  game: 'Gra'
}

const typeColors: Record<Production['type'], string> = {
  movie: 'bg-blue-500/80 group-hover:bg-blue-500',
  series: 'bg-purple-500/80 group-hover:bg-purple-500',
  game: 'bg-green-500/80 group-hover:bg-green-500'
}
</script>

<template>
  <RouterLink :to="{ name: 'production-cast', params: { id: production.id } }">
    <Card
      class="group w-64 m-4 rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-gray-500/20 dark:hover:shadow-gray-900/40 bg-gradient-to-tr from-gray-50/5 to-transparent dark:from-gray-700/5"
    >
      <template #header>
        <div class="w-full h-96 overflow-hidden relative">
          <img
            :src="production.imageUrl"
            :alt="production.title"
            class="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
          <div
            class="absolute top-3 left-3 px-3 py-1.5 bg-black/60 text-white rounded-full text-sm font-semibold transition-colors duration-300 group-hover:bg-black/80"
          >
            {{ production.year }}
          </div>
          <div
            class="absolute top-3 right-3 px-3 py-1.5 text-white rounded-full text-sm font-semibold"
            :class="typeColors[production.type]"
          >
            {{ typeTranslations[production.type] }}
          </div>
        </div>
      </template>

      <template #title>
        <div class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {{ production.title }}
        </div>
      </template>
    </Card>
  </RouterLink>
</template>
