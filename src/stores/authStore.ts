import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import type { AuthUser, BaseCredentials } from '@/types/types'
import { defineStore } from 'pinia'
import { auth } from '@/ts/firebase'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser>({ id: null, email: null })
  const init = async () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      // loading.value = true
      try {
        if (firebaseUser) {
          user.value.id = firebaseUser.uid
          user.value.email = firebaseUser.email
          // isAuthenticated.value = true
        } else {
          user.value = { id: null, email: null }
          // isAuthenticated.value = false
        }
      } finally {
        // loading.value = false
      }
    })
  }

  const registerUser = async (credentials: BaseCredentials) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
      return userCredential.user
    } catch (error: unknown) {
      throw error
    }
  }

  const loginUser = async (credentials: BaseCredentials) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      return userCredential.user
    } catch (error: unknown) {
      throw error
    }
  }

  const logoutUser = async () => {
    try {
      await signOut(auth)
      user.value = { id: null, email: null }
    } catch (error: unknown) {
      throw error
    }
  }

  return { user, init, registerUser, loginUser, logoutUser }
})
