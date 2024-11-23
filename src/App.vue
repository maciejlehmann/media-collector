<script setup lang="ts">
import { MediaImporter } from '@/services/MediaImporter'
import SystemHeader from '@/components/SystemHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => await authStore.init())

const importSeries = async () => {
  const mediaImporter = new MediaImporter()
  const importResult = await mediaImporter.importSeries(75006)
  console.log('Import result:', importResult)

  const theme = {
    color1: '#1E40AF',
    color2: '#DC2626',
    color3: '#1F2937',
    color4: '#B91C1C',
    color5: '#1E40AF',
    animationDuration: '12s'
  }

  await mediaImporter.updateTheme(importResult.seriesId, theme)
}

const importMovie = async () => {
  const mediaImporter = new MediaImporter()
  const importResult = await mediaImporter.importMovie(299534)
  console.log('Import result:', importResult)
  const theme = {
    color1: '#266ef6', // Deep purple
    color2: '#e429f2', // Indigo
    color3: '#ff8b00', // Violet
    color4: '#ff0130', // Indigo
    color5: '#12e772', // Closing the loop
    animationDuration: '15s'
  }

  await mediaImporter.updateTheme(importResult.movieId, theme)
}

</script>

<template>
  <div class="flex gap-5">
    <Button label="Import series" @click="importSeries" />
    <Button label="Import movie" @click="importMovie" />
  </div>
  <div class="min-h-screen bg-gray-900">
    <SystemHeader />
    <RouterView />
  </div>
</template>
