<script setup lang="ts">
import { email, minLength, object, pipe, regex, string } from 'valibot'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type {
  FormFieldResolverContext,
  RegisterFormSubmit,
  FormFieldResolver,
  RegisterFormState,
  ValidationError
} from '@/types/forms'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const passwordValidation = pipe(
  string('Hasło jest wymagane'),
  minLength(6, 'Hasło musi mieć minimum 6 znaków'),
  regex(/[A-Z]/, 'Hasło musi zawierać wielką literę'),
  regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
)

const registerSchema = object({
  email: pipe(
    string('Email jest wymagany'),
    minLength(1, 'Email jest wymagany'),
    email('Nieprawidłowy format email')
  ),
  password: passwordValidation,
  confirmPassword: passwordValidation
})

const initialValues = ref<RegisterFormState>({ email: '', password: '', confirmPassword: '' })

const confirmPasswordResolver: FormFieldResolver = (
  context: FormFieldResolverContext<RegisterFormState>
) => {
  const errors: ValidationError[] = []
  const formValues = context.form?.getValues()

  if (!formValues) return { errors }

  if (context.value !== formValues.password) errors.push({ message: 'Hasła nie są takie same' })

  return { errors }
}

const onFormSubmit = async (e: RegisterFormSubmit) => {
  if (e.valid) {
    try {
      await authStore.registerUser({ email: e.values.email, password: e.values.password })

      toast.add({
        severity: 'success',
        summary: 'Rejestracja pomyślna',
        detail: 'Twoje konto zostało utworzone',
        life: 3000
      })

      // Przekierowanie na stronę logowania
      router.push({ name: 'login-page' })
    } catch (error: unknown) {
      let errorMessage = 'Nieznany błąd podczas rejestracji'

      if (error instanceof Error) {
        // Mapowanie kodów błędów Firebase na przyjazne komunikaty
        switch (error.message) {
          case 'auth/email-already-in-use':
            errorMessage = 'Ten adres email jest już zarejestrowany'
            break
          case 'auth/invalid-email':
            errorMessage = 'Nieprawidłowy adres email'
            break
          case 'auth/operation-not-allowed':
            errorMessage = 'Rejestracja jest obecnie niedostępna'
            break
          case 'auth/weak-password':
            errorMessage = 'Hasło jest zbyt słabe'
            break
          default:
            errorMessage = error.message
        }
      }

      toast.add({ severity: 'error', summary: 'Błąd rejestracji', detail: errorMessage, life: 5000 })
    }
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800/50 to-gray-900/50">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <Toast />

      <h2 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Zarejestruj się
      </h2>

      <Form
        v-slot="$form"
        :initial-values="initialValues"
        :resolver="valibotResolver(registerSchema)"
        :validate-on-blur="true"
        :validate-on-value-update="['email']"
        :validate-on-mount="false"
        :validate-on-submit="true"
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
            placeholder="Hasło"
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
            placeholder="Potwierdź hasło"
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
            label="Zarejestruj się"
            class="w-full"
          />

          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            Masz już konto?
            <router-link
              :to="{ name: 'login-page' }"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Zaloguj się
            </router-link>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>
