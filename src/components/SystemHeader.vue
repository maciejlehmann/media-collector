<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const { t, locale } = useI18n()

// Available languages
const languages = [
  { name: t('header.english'), code: 'en' },
  { name: t('header.polish'), code: 'pl' },
  { name: t('header.german'), code: 'de' },
  { name: t('header.french'), code: 'fr' },
  { name: t('header.italian'), code: 'it' },
  { name: t('header.spanish'), code: 'es' }
]

// Current language
const currentLanguage = ref(locale.value)

// Change language function
const changeLanguage = (langCode: string) => {
  locale.value = langCode
  currentLanguage.value = langCode
  localStorage.setItem('userLocale', langCode)
}

const navigateToLogin = () => router.push({ name: 'login-page' })
const navigateToRegister = () => router.push({ name: 'register-page' })

const handleLogout = async () => {
  try {
    await authStore.logoutUser()
    toast.add({ severity: 'success', summary: t('header.logoutSuccess'), life: 3000 })
    await router.push({ name: 'login-page' })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('header.logoutError'),
      detail: error instanceof Error ? error.message : t('header.unknownError'),
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
            {{ t('header.appName') }}
          </RouterLink>
        </div>

        <!-- Language Switcher -->
        <div class="flex items-center">
          <Dropdown
            v-model="currentLanguage"
            :options="languages"
            optionLabel="name"
            optionValue="code"
            class="w-full md:w-14rem"
            @change="changeLanguage(currentLanguage)"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <span>{{ languages.find(lang => lang.code === slotProps.value)?.name }}</span>
              </div>
              <span v-else>
                {{ t('header.language') }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </Dropdown>
        </div>

        <div v-if="!authStore.user.id" class="flex gap-4">
          <Button
            class="hover:bg-blue-700/10"
            :label="t('header.login')"
            severity="info"
            outlined
            @click="navigateToLogin"
          />
          <Button
            class="hover:bg-blue-600"
            :label="t('header.register')"
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
            :label="t('header.logout')"
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
