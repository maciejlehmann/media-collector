<script setup lang="ts">
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import { email, minLength, object, pipe, string } from 'valibot'
import type { LoginFormSubmit, LoginFormState } from '@/types/forms'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FirebaseError } from 'firebase/app'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const isLoading = ref(false)

const loginSchema = object({
  email: pipe(
    string(t('login.emailRequired')),
    minLength(1, t('login.emailRequired')),
    email(t('login.invalidEmail'))
  ),
  password: pipe(
    string(t('login.passwordRequired')),
    minLength(6, t('login.passwordMinLength'))
  )
})

const initialValues = ref<LoginFormState>({ email: '', password: '' })

const resolver = valibotResolver(loginSchema)

const onFormSubmit = async (e: LoginFormSubmit) => {
  if (e.valid) {
    isLoading.value = true
    try {
      await authStore.loginUser({ email: e.values.email, password: e.values.password })

      toast.add({
        severity: 'success',
        summary: t('login.successTitle'),
        detail: t('login.successMessage'),
        life: 3000
      })

      // Redirect to home page after login
      router.push({ name: 'productions-list' })
    } catch (error: unknown) {
      let errorMessage = t('login.errorUnknown')

      if (error instanceof Error && 'code' in error) {
        // Map Firebase error codes to user-friendly messages
        const firebaseError = error as FirebaseError
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            errorMessage = t('login.errorUserNotFound')
            break
          case 'auth/wrong-password':
            errorMessage = t('login.errorWrongPassword')
            break
          case 'auth/invalid-email':
            errorMessage = t('login.errorInvalidEmail')
            break
          case 'auth/user-disabled':
            errorMessage = t('login.errorUserDisabled')
            break
          case 'auth/too-many-requests':
            errorMessage = t('login.errorTooManyRequests')
            break
          default:
            errorMessage = t('login.errorDefault')
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.add({
        severity: 'error',
        summary: t('login.errorTitle'),
        detail: errorMessage,
        life: 5000
      })
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800/50 to-gray-900/50">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <Toast />

      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        {{ t('login.title') }}
      </h2>

      <Form
        v-slot="$form"
        :initial-values="initialValues"
        :resolver="resolver"
        :validate-on-blur="true"
        :validate-on-value-update="false"
        @submit="onFormSubmit"
        class="flex flex-col gap-4"
      >
        <FormField
          v-slot="$field"
          name="email"
          :validate-on-value-update="true"
          class="flex flex-col gap-1"
        >
          <InputText
            type="email"
            placeholder="Email"
            class="w-full"
          />
          <Message
            v-if="$field?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField
          v-slot="$field"
          name="password"
          class="flex flex-col gap-1"
        >
          <Password
            :placeholder="t('login.passwordLabel')"
            :feedback="false"
            toggleMask
            class="w-full"
            input-class="w-full"
          />
          <Message
            v-if="$field?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <div class="flex flex-col gap-4">
          <Button
            type="submit"
            :label="isLoading ? t('login.buttonLoggingIn') : t('login.buttonLogin')"
            :disabled="isLoading"
            class="w-full"
          />

          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            {{ t('login.noAccount') }}
            <RouterLink
              :to="{ name: 'register-page' }"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {{ t('login.register') }}
            </RouterLink>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>
