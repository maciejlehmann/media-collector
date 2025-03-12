<script setup lang="ts">
import { email, minLength, object, pipe, regex, string, custom } from 'valibot'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FirebaseError } from 'firebase/app'
import type {
  FormFieldResolverContext,
  RegisterFormSubmit,
  FormFieldResolver,
  RegisterFormState,
  ValidationError
} from '@/types/forms'
import type { FormFieldResolverOptions } from '@primevue/forms'

const { t } = useI18n()

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const isLoading = ref(false)

const passwordValidation = pipe(
  string(t('register.passwordRequired')),
  minLength(6, t('register.passwordMinLength')),
  regex(/[A-Z]/, t('register.passwordUppercase')),
  regex(/[0-9]/, t('register.passwordDigit'))
)

const registerSchema = object({
  email: pipe(
    string(t('register.emailRequired')),
    minLength(1, t('register.emailRequired')),
    email(t('register.invalidEmail'))
  ),
  password: passwordValidation,
  confirmPassword: pipe(
    string(t('register.confirmPasswordRequired')),
    minLength(1, t('register.confirmPasswordRequired')),
    custom<string>((value, ctx) => value === ctx.parent.password, t('register.passwordsNotMatch'))
  )
})

const initialValues = ref<RegisterFormState>({ email: '', password: '', confirmPassword: '' })

const confirmPasswordResolver = (context: FormFieldResolverOptions) => {
  const errors: ValidationError[] = []

  if (context.value.confirmPassword !== context.value.password) errors.push({ message: t('register.passwordsNotMatch') })

  return { errors }
}

const onFormSubmit = async (e: RegisterFormSubmit) => {
  if (e.valid) {
    isLoading.value = true
    try {
      await authStore.registerUser({ email: e.values.email, password: e.values.password })

      toast.add({
        severity: 'success',
        summary: t('register.successTitle'),
        detail: t('register.successMessage'),
        life: 3000
      })

      // Redirect to login page
      router.push({ name: 'login-page' })
    } catch (error: unknown) {
      let errorMessage = t('register.errorUnknown')

      if (error instanceof Error && 'code' in error) {
        // Map Firebase error codes to user-friendly messages
        const firebaseError = error as FirebaseError
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = t('register.errorEmailInUse')
            break
          case 'auth/invalid-email':
            errorMessage = t('register.errorInvalidEmail')
            break
          case 'auth/operation-not-allowed':
            errorMessage = t('register.errorOperationNotAllowed')
            break
          case 'auth/weak-password':
            errorMessage = t('register.errorWeakPassword')
            break
          default:
            errorMessage = firebaseError.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.add({
        severity: 'error',
        summary: t('register.errorTitle'),
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
        {{ t('register.title') }}
      </h2>

      <Form
        v-slot="$form"
        :initial-values="initialValues"
        :resolver="valibotResolver(registerSchema)"
        :validate-on-blur="true"
        :validate-on-value-update="['email']"
        class="flex flex-col gap-4"
        :validate-on-mount="false"
        :validate-on-submit="true"
        @submit="onFormSubmit"
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
            :autofocus="false"
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
            placeholder="Password"
            :feedback="true"
            toggleMask
            class="w-full"
            input-class="w-full"
            :autofocus="false"
          />
          <Message
            v-if="$field?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            <ul class="my-0 px-4 flex flex-col gap-1">
              <li v-for="(error, index) of $field.errors" :key="index">
                {{ error.message }}
              </li>
            </ul>
          </Message>
        </FormField>

        <FormField
          v-slot="$field"
          name="confirmPassword"
          :resolver="confirmPasswordResolver"
          class="flex flex-col gap-1"
        >
          <Password
            placeholder="Confirm Password"
            :feedback="false"
            toggleMask
            class="w-full"
            input-class="w-full"
            :autofocus="false"
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
            :label="isLoading ? t('register.buttonRegistering') : t('register.buttonRegister')"
            :disabled="isLoading"
            class="w-full"
          />

          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            {{ t('register.haveAccount') }}
            <router-link
              :to="{ name: 'login-page' }"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              {{ t('register.login') }}
            </router-link>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>
