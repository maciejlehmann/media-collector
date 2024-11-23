<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const navigateToLogin = () => router.push({ name: 'login-page' })
const navigateToRegister = () => router.push({ name: 'register-page' })

const handleLogout = async () => {
  try {
    await authStore.logoutUser()
    toast.add({ severity: 'success', summary: 'Wylogowano pomyślnie', life: 3000 })
    await router.push({ name: 'login-page' })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Błąd wylogowywania',
      detail: error instanceof Error ? error.message : 'Nieznany błąd',
      life: 3000
    })
  }
}
</script>

<template>
  <nav class="bg-gray-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex-shrink-0">
          <RouterLink
            class="text-xl font-bold text-white hover:text-gray-200"
            :to="{ name: 'productions-list' }"
          >
            Media Collector
          </RouterLink>
        </div>

        <div v-if="!authStore.user.id" class="flex gap-4">
          <Button
            class="hover:bg-blue-700/10"
            label="Zaloguj się"
            severity="info"
            outlined
            @click="navigateToLogin"
          />
          <Button
            class="hover:bg-blue-600"
            label="Zarejestruj się"
            severity="info"
            @click="navigateToRegister"
          />
        </div>

        <div v-else class="flex items-center gap-4">
          <span class="text-gray-300">
            {{ authStore.user.email }}
          </span>
          <Button
            class="hover:bg-red-700/10"
            label="Wyloguj się"
            severity="danger"
            outlined
            @click="handleLogout"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.text-gray-300 {
  @apply text-sm font-medium;
}
</style>
