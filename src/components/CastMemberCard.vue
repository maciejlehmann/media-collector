<script setup lang="ts">
import type { CastMember } from '@/types/types'

const props = defineProps<{ castMember: CastMember }>()
</script>

<template>
  <Card
    class="w-72 m-4 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 backdrop-blur-sm"
    :class="[
      { 'filter grayscale opacity-75 hover:grayscale-0 hover:opacity-100': !castMember.hasPhoto },
      { 'bg-gradient-to-br from-success/5 to-transparent': castMember.hasPhoto },
    ]"
  >
    <template #header>
      <div class="w-full h-96 overflow-hidden group relative">
        <img
          :src="castMember.imageUrl"
          :alt="castMember.name"
          class="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-1"
        />
        <div
          v-if="castMember.hasPhoto"
          class="absolute inset-0 bg-gradient-to-t from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      </div>
    </template>
    <template #title>
      <div class="text-xl font-bold tracking-tight">{{ castMember.name }}</div>
    </template>
    <template #subtitle>
      <div class="text-gray-600 dark:text-gray-400 font-medium">{{ castMember.role }}</div>
    </template>
    <template #footer>
      <div class="flex flex-col gap-2">
        <Button
          :label="castMember.hasPhoto ? 'Mam zdjęcie' : 'Brak zdjęcia'"
          class="p-button-flex"
          :severity="castMember.hasPhoto ? 'success' : 'secondary'"
          :class="['w-full font-semibold']"
        >
          <template #icon>
            <IconifyIcon
              :icon="castMember.hasPhoto ? 'mdi:check-circle' : 'mdi:camera'"
              :class="castMember.hasPhoto ? 'text-white' : 'text-gray-50'"
              width="32"
            />
          </template>
        </Button>
        <Button
          :label="castMember.hasAuto ? 'Mam autograf' : 'Brak autografu'"
          class="p-button-flex"
          :severity="castMember.hasAuto ? 'help' : 'secondary'"
          :class="['w-full font-semibold']"
        >
          <template #icon>
            <IconifyIcon
              :icon="castMember.hasAuto ? 'mdi:check-circle' : 'mdi:draw-pen'"
              :class="castMember.hasAuto ? 'text-white' : 'text-gray-50'"
              width="32"
            />
          </template>
        </Button>
      </div>
    </template>
  </Card>
</template>
