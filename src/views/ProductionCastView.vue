<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeMount } from 'vue'
import { useProductionsStore } from '@/stores/productionsStore'
import CastMemberCard from '@/components/CastMemberCard.vue'

const router = useRouter()
const route = useRoute()
const store = useProductionsStore()

const production = computed(() => store.productions.list.find((prod) => prod.id === route.params.id))
const collectionStats = computed(() => {
  const castMembers = store.productionCastMembers.list
  return {
    photos: {
      collected: castMembers.filter((member) => member.hasPhoto).length,
      total: castMembers.length,
    },
    autos: {
      collected: castMembers.filter((member) => member.hasAuto).length,
      total: castMembers.length,
    },
  }
})

onBeforeMount(async () => {
  if (store.productions.list.length === 0) await store.getProductions()
  await store.getProductionCastMembers(route.params.id as string)
})

const goBack = () => router.push({ name: 'productions-list' })

const productionThemes = {
  'got-1399': {
    // Lód i ogień - inspirowane smokami, zimą i rodem Targaryenów
    from: 'from-blue-600',
    via: 'via-slate-500',
    to: 'to-red-600',
  },
  'tvd-18165': {
    // Ciemność i krew - inspirowane wampirzą tematyką
    from: 'from-red-900',
    via: 'via-purple-800',
    to: 'to-red-600',
  },
  'st-2016': {
    // Neon i mrok - inspirowane estetyką lat 80. i "drugiej strony"
    from: 'from-pink-500',
    via: 'via-purple-600',
    to: 'to-indigo-700',
  },
  'the100-2014': {
    // Zieleń i technologia - inspirowane post-apokaliptycznym światem
    from: 'from-green-600',
    via: 'via-teal-500',
    to: 'to-blue-600',
  },
  'tw-2011': {
    // Księżyc i las - inspirowane wilkołaczą tematyką
    from: 'from-yellow-400',
    via: 'via-amber-600',
    to: 'to-gray-700',
  },
}

const gradientColors = computed(() => {
  if (!production.value)
    return {
      from: 'from-gray-500',
      via: 'via-gray-600',
      to: 'to-gray-700',
    }

  return (
    productionThemes[production.value.id] || {
      from: 'from-blue-500',
      via: 'via-indigo-500',
      to: 'to-purple-500',
    }
  )
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="flex items-center justify-between p-4 bg-gray-800/50 dark:bg-gray-900 sticky top-0 z-10">
      <Button class="p-button-flex" label="Powrót" severity="secondary" @click="goBack">
        <template #icon>
          <IconifyIcon icon="mdi:arrow-left-bold" width="24" />
        </template>
      </Button>

      <div class="flex-1 text-center mx-4">
        <template v-if="!store.productions.loading && production">
          <h1
            class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight break-words"
            style="text-shadow: 0 0 20px rgba(0, 0, 0, 0.3)"
          >
            <span
              class="bg-gradient-to-r bg-clip-text text-transparent animate-gradient"
              :class="[gradientColors.from, gradientColors.via, gradientColors.to]"
            >
              {{ production.title }}
            </span>
            <span class="text-xl sm:text-2xl text-gray-300 dark:text-gray-400 font-medium ml-4">
              {{ production.year }}
            </span>
          </h1>
        </template>
        <template v-else>
          <Skeleton height="4rem" width="20rem" class="mx-auto" />
        </template>
      </div>

      <Skeleton v-if="store.productions.loading && store.productionCastMembers.loading" height="2rem" width="15rem" />
      <div
        v-else
        class="flex flex-col items-end gap-2 text-xl sm:text-2xl font-semibold text-gray-600 dark:text-gray-400"
      >
        <div class="flex items-center gap-2 whitespace-nowrap text-sky-500">
          <IconifyIcon icon="mdi:camera" width="24" />
          <span>{{ collectionStats.photos.collected }}/{{ collectionStats.photos.total }}</span>
        </div>
        <div class="flex items-center gap-2 whitespace-nowrap text-purple-500">
          <IconifyIcon icon="mdi:draw-pen" width="24" />
          <span>{{ collectionStats.autos.collected }}/{{ collectionStats.autos.total }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-4">
      <template v-if="store.productionCastMembers.loading">
        <div v-for="n in 12" :key="n" class="w-72 m-4">
          <Card>
            <template #header>
              <Skeleton height="24rem" />
            </template>
            <template #title>
              <Skeleton width="70%" height="1.5rem" />
            </template>
            <template #subtitle>
              <Skeleton width="50%" height="1rem" />
            </template>
            <template #footer>
              <Skeleton height="2.5rem" width="100%" />
            </template>
          </Card>
        </div>
      </template>

      <CastMemberCard
        v-else
        v-for="castMember in store.productionCastMembers.list"
        :key="castMember.id"
        :cast-member="castMember"
      />
    </div>
  </div>
</template>
