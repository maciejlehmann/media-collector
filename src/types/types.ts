export interface Production {
  type: 'movie' | 'series' | 'game'
  description: string
  imageUrl: string
  title: string
  year: string
  id: string
}

export interface CastMember {
  movieIds: string[]
  hasPhoto: boolean
  hasAuto: boolean
  imageUrl: string
  name: string
  role: string
  id: string
}

export interface ProductionsList {
  list: Production[]
  loading: boolean
}

interface ProductionActor {
  orderNumber: number
  hasPhoto: boolean
  imageUrl: string
  hasAuto: boolean
  name: string
  role: string
  id: string
}

export interface ProductionCastMembersList {
  list: ProductionActor[]
  loading: boolean
}

import type { FormFieldState, FormSubmitEvent } from 'primevue/forms'

// Bazowe interfejsy dla credentials
export interface BaseCredentials {
  email: string
  password: string
}

// Rozszerzony interface dla formularza rejestracji
export interface RegisterFormState extends BaseCredentials {
  confirmPassword: string
}

// Interface dla logowania używa bazowych credentials
export type LoginFormState = BaseCredentials

// Generic typ dla submitu formularza
export interface FormSubmitGeneric<T> extends FormSubmitEvent {
  values: T
  states: Record<keyof T, FormFieldState>
}

// Konkretne implementacje FormSubmit
export type LoginFormSubmit = FormSubmitGeneric<LoginFormState>
export type RegisterFormSubmit = FormSubmitGeneric<RegisterFormState>

// Context dla resolverów pól formularza
export interface FormFieldResolverContext<T = any> {
  value: string
  name?: string
  formState: T
  form?: {
    getValues: () => T
  }
}

// Interface dla błędów walidacji
export interface ValidationError {
  message: string
  type?: string
}

// Typ dla resolvera pola formularza
export type FormFieldResolver<T = any> = (
  context: FormFieldResolverContext<T>
) => {
  errors: ValidationError[]
}

// Typ dla resolvera całego formularza
export type FormResolver<T = any> = (options: {
  values: T
  names?: string[]
}) => {
  errors: Record<keyof T, ValidationError[]>
}

export interface AuthUser {
  id: string | null
  email: string | null
}
