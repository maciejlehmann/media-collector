import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth'
import type { BaseCredentials } from '@/types/forms'
import type { AuthUser } from '@/types/auth'
import { auth } from '@/ts/firebase'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser>({ id: null, email: null })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value.id)

  const handleAuthError = (error: any) => {
    let errorMessage = 'Wystąpił nieznany błąd'

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Ten email jest już używany'
        break
      case 'auth/invalid-email':
        errorMessage = 'Nieprawidłowy adres email'
        break
      case 'auth/operation-not-allowed':
        errorMessage = 'Operacja niedozwolona'
        break
      case 'auth/weak-password':
        errorMessage = 'Hasło jest za słabe'
        break
      case 'auth/user-not-found':
        errorMessage = 'Nie znaleziono użytkownika'
        break
      case 'auth/wrong-password':
        errorMessage = 'Nieprawidłowe hasło'
        break
    }

    error.value = errorMessage
    throw new Error(errorMessage)
  }

  const updateUserState = (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) user.value = { id: firebaseUser.uid, email: firebaseUser.email }
    else user.value = { id: null, email: null }
  }

  const init = () => {
    loading.value = true

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        try {
          updateUserState(firebaseUser)
          resolve(firebaseUser)
        } catch (err) {
          console.error('Error during auth state change:', err)
          error.value = 'Błąd podczas inicjalizacji autoryzacji'
        } finally {
          loading.value = false
        }
      })
    })
  }

  const registerUser = async (credentials: BaseCredentials) => {
    try {
      loading.value = true
      error.value = null

      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
      updateUserState(userCredential.user)
      return userCredential.user
    } catch (err: any) {
      handleAuthError(err)
    } finally {
      loading.value = false
    }
  }

  const loginUser = async (credentials: BaseCredentials) => {
    try {
      loading.value = true
      error.value = null

      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      updateUserState(userCredential.user)
      return userCredential.user
    } catch (err: any) {
      handleAuthError(err)
    } finally {
      loading.value = false
    }
  }

  const logoutUser = async () => {
    try {
      loading.value = true
      error.value = null

      await signOut(auth)
      updateUserState(null)
    } catch (err: any) {
      error.value = 'Błąd podczas wylogowywania'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    init,
    registerUser,
    loginUser,
    logoutUser
  }
})
