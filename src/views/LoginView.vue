<script setup lang="ts">
import type { LoginFormState, LoginFormSubmit } from '@/types/types'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import { email, minLength, object, pipe, string } from 'valibot'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const loginSchema = object({
  email: pipe(
    string('Email jest wymagany'),
    minLength(1, 'Email jest wymagany'),
    email('Nieprawidłowy format email')
  ),
  password: pipe(
    string('Hasło jest wymagane'),
    minLength(6, 'Hasło musi mieć minimum 6 znaków')
  )
})

const initialValues = ref<LoginFormState>({ email: '', password: '' })

const resolver = valibotResolver(loginSchema)

const onFormSubmit = async (e: LoginFormSubmit) => {
  if (e.valid) {
    try {
      await authStore.loginUser({ email: e.values.email, password: e.values.password })

      toast.add({
        severity: 'success',
        summary: 'Zalogowano pomyślnie',
        detail: 'Witaj z powrotem!',
        life: 3000
      })

      // Przekierowanie na stronę główną po zalogowaniu
      router.push({ name: 'productions-list' })
    } catch (error: unknown) {
      let errorMessage = 'Nieznany błąd podczas logowania'

      if (error instanceof Error) {
        // Mapowanie kodów błędów Firebase na przyjazne komunikaty
        switch (error.message) {
          case 'auth/user-not-found':
            errorMessage = 'Nie znaleziono użytkownika o podanym adresie email'
            break
          case 'auth/wrong-password':
            errorMessage = 'Nieprawidłowe hasło'
            break
          case 'auth/invalid-email':
            errorMessage = 'Nieprawidłowy adres email'
            break
          case 'auth/user-disabled':
            errorMessage = 'To konto zostało zablokowane'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Zbyt wiele nieudanych prób logowania. Spróbuj ponownie później'
            break
          default:
            errorMessage = 'Błąd podczas logowania. Spróbuj ponownie'
        }
      }

      toast.add({
        severity: 'error',
        summary: 'Błąd logowania',
        detail: errorMessage,
        life: 5000
      })
    }
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800/50 to-gray-900/50">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <Toast />

      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Zaloguj się
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
            placeholder="Hasło"
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
            label="Zaloguj się"
            class="w-full"
          />

          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            Nie masz jeszcze konta?
            <RouterLink
              :to="{ name: 'register-page' }"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Zarejestruj się
            </RouterLink>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>
