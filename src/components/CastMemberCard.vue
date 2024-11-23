<script setup lang="ts">
import { useUserCastMemberStore } from '@/stores/userCastMemberStore'
import type { ProductionActor } from '@/types/cast'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const props = defineProps<{ castMember: ProductionActor }>()

const auth = useAuthStore()
const userCastMemberStore = useUserCastMemberStore()

const userCollectionStatus = computed(() => {
  if (!auth.user.id) return { hasPhoto: false, hasAuto: false }
  return userCastMemberStore.checkUserCastMemberData(props.castMember.castMemberId)
})

const togglePhoto = async () => {
  if (!auth.user.id) return

  await userCastMemberStore.setUserCastMemberData(auth.user.id, props.castMember.castMemberId,
    { hasPhoto: !userCollectionStatus.value.hasPhoto, hasAuto: userCollectionStatus.value.hasAuto }
  )
}

const toggleAuto = async () => {
  if (!auth.user.id) return

  await userCastMemberStore.setUserCastMemberData(auth.user.id, props.castMember.castMemberId,
    { hasAuto: !userCollectionStatus.value.hasAuto, hasPhoto: userCollectionStatus.value.hasPhoto }
  )
}
</script>

<template>
  <Card
    class="group w-72 m-4 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 backdrop-blur-sm"
    :class="[
      { 'filter grayscale opacity-75 hover:grayscale-0 hover:opacity-100': !userCollectionStatus.hasPhoto },
      { 'bg-gradient-to-br from-success/5 to-transparent': userCollectionStatus.hasPhoto },
    ]"
  >
    <template #header>
      <div class="w-full h-96 overflow-hidden relative">
        <img
          :src="castMember.imageUrl"
          :alt="castMember.name"
          class="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-1"
        />
        <div
          v-if="userCollectionStatus.hasPhoto"
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
          :label="userCollectionStatus.hasPhoto ? 'Mam zdjęcie' : 'Brak zdjęcia'"
          :severity="userCollectionStatus.hasPhoto ? 'success' : 'secondary'"
          :disabled="!auth.isAuthenticated"
          :class="['w-full font-semibold']"
          class="p-button-flex"
          @click="togglePhoto"
        >
          <template #icon>
            <IconifyIcon
              :icon="userCollectionStatus.hasPhoto ? 'mdi:check-circle' : 'mdi:camera'"
              :class="userCollectionStatus.hasPhoto ? 'text-white' : 'text-gray-50'"
              width="32"
            />
          </template>
        </Button>
        <Button
          :label="userCollectionStatus.hasAuto ? 'Mam autograf' : 'Brak autografu'"
          :severity="userCollectionStatus.hasAuto ? 'help' : 'secondary'"
          :disabled="!auth.isAuthenticated"
          :class="['w-full font-semibold']"
          class="p-button-flex"
          @click="toggleAuto"
        >
          <template #icon>
            <IconifyIcon
              :icon="userCollectionStatus.hasAuto ? 'mdi:check-circle' : 'mdi:draw-pen'"
              :class="userCollectionStatus.hasAuto ? 'text-white' : 'text-gray-50'"
              width="32"
            />
          </template>
        </Button>
      </div>
    </template>
  </Card>
</template>
