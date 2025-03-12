import type { FormFieldState, FormSubmitEvent } from "@primevue/forms"


export interface BaseCredentials {
  email: string
  password: string
}

export interface RegisterFormState extends BaseCredentials {
  confirmPassword: string
}

export type LoginFormState = BaseCredentials

export interface FormSubmitGeneric<T extends Record<string, any>> extends FormSubmitEvent {
  values: T
  states: Record<keyof T, FormFieldState>
}

export type LoginFormSubmit = FormSubmitGeneric<LoginFormState>
export type RegisterFormSubmit = FormSubmitGeneric<RegisterFormState>

export interface FormFieldResolverContext<T = any> {
  value: string
  name?: string
  formState: T
  form?: {
    getValues: () => T
  }
}

export interface ValidationError {
  message: string
  type?: string
}

export type FormFieldResolver<T = any> = (context: FormFieldResolverContext<T>) => {
  errors: ValidationError[]
}
