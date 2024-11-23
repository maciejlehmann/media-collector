<script setup lang="ts">
import { useUserCastMemberStore } from '@/stores/userCastMemberStore'
import { useProductionsStore } from '@/stores/productionsStore'
import CastMemberCard from '@/components/CastMemberCard.vue'
import { computed, onBeforeMount, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'

const userCastMemberStore = useUserCastMemberStore()
const productionsStore = useProductionsStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const production = computed(() =>
  productionsStore.productions.list.find((prod) => prod.id === route.params.id)
)

const collectionStats = computed(() => {
  if (!authStore.isAuthenticated) {
    return {
      photos: { collected: 0, total: productionsStore.productionCastMembers.list.length },
      autos: { collected: 0, total: productionsStore.productionCastMembers.list.length }
    }
  }

  const castMembers = productionsStore.productionCastMembers.list
  return {
    photos: {
      collected: castMembers.filter(member => userCastMemberStore.checkUserCastMemberData(member.id).hasPhoto).length,
      total: castMembers.length
    },
    autos: {
      collected: castMembers.filter(member => userCastMemberStore.checkUserCastMemberData(member.id).hasAuto).length,
      total: castMembers.length
    }
  }
})

onBeforeMount(async () => {
  if (productionsStore.productions.list.length === 0) await productionsStore.getProductions()
  await productionsStore.getProductionCastMembers(route.params.id as string)
})

// Ładowanie danych użytkownika po zalogowaniu
watchEffect(async () => {
  if (authStore.isAuthenticated && authStore.user.id) {
    await userCastMemberStore.getUserCastMemberData(authStore.user.id)
  }
})

const goBack = () => router.push({ name: 'productions-list' })

const gradientColors = computed(() => {
  const theme = productionsStore.getProductionTheme(production.value)
  return { from: theme.fromColor, via: theme.viaColor, to: theme.toColor }
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
        <template v-if="!productionsStore.productions.loading && production">
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

      <Skeleton
        v-if="productionsStore.productions.loading && productionsStore.productionCastMembers.loading"
        height="2rem"
        width="15rem"
      />
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
      <template v-if="productionsStore.productionCastMembers.loading">
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
        v-for="castMember in productionsStore.productionCastMembers.list"
        :key="castMember.id"
        :cast-member="castMember"
      />
    </div>
  </div>
</template>
