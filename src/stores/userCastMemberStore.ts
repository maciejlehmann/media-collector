import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import type { UserCastMemberState, UserCastMemberStatus } from '@/types/user'
import type { FirestoreUserCastMemberData } from '@/types/firestore'
import { defineStore } from 'pinia'
import { db } from '@/ts/firebase'
import { ref } from 'vue'

export const useUserCastMemberStore = defineStore('userCastMember', () => {
  const userCastMemberData = ref<UserCastMemberState>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUserCastMemberData = async (userId: string): Promise<UserCastMemberState> => {
    try {
      loading.value = true
      error.value = null

      const q = query(collection(db, 'userCastMembers'), where('userId', '==', userId))

      const querySnapshot = await getDocs(q)
      const data: UserCastMemberState = {}

      querySnapshot.forEach((doc) => {
        // Teraz używamy bezpośrednio ID aktora z dokumentu
        const docData = doc.data() as FirestoreUserCastMemberData
        data[docData.castMemberId] = {
          wantsPhoto: docData.wantsPhoto,
          wantsAuto: docData.wantsAuto,
          hasPhoto: docData.hasPhoto,
          hasAuto: docData.hasAuto,
        }
      })

      userCastMemberData.value = data
      return data
    } catch (e) {
      error.value = 'Błąd podczas pobierania danych'
      console.error('Error fetching user cast member data:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const setUserCastMemberData = async (
    userId: string,
    castMemberId: string,
    data: Partial<UserCastMemberStatus,
  ): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const docId = `${userId}_${castMemberId}`

      if (!data.hasPhoto && !data.hasAuto && !data.wantsAuto && !data.wantsPhoto) {
        await deleteUserCastMemberData(userId, castMemberId)
        return
      }

      const docData = {
        wantsPhoto: !!data.wantsPhoto,
        updatedAt: serverTimestamp(),
        wantsAuto: !!data.wantsAuto,
        hasPhoto: !!data.hasPhoto,
        hasAuto: !!data.hasAuto,
        castMemberId,
        userId
      }

      await setDoc(doc(db, 'userCastMembers', docId), docData, { merge: true })

      userCastMemberData.value[castMemberId] = {
        wantsPhoto: !!data.wantsAuto,
        wantsAuto: !!data.wantsAuto,
        hasPhoto: !!data.hasPhoto,
        hasAuto: !!data.hasAuto
      }
    } catch (e) {
      error.value = 'Błąd podczas zapisywania danych'
      console.error('Error setting user cast member data:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteUserCastMemberData = async (userId: string, castMemberId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const docId = `${userId}_${castMemberId}`
      await deleteDoc(doc(db, 'userCastMembers', docId))

      delete userCastMemberData.value[castMemberId]
    } catch (e) {
      error.value = 'Błąd podczas usuwania danych'
      console.error('Error deleting user cast member data:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const checkUserCastMemberData = (castMemberId: string): UserCastMemberStatus => {
    const data = userCastMemberData.value[castMemberId]

    return {
      wantsPhoto: data?.wantsPhoto || false,
      wantsAuto: data?.wantsAuto || false,
      hasPhoto: data?.hasPhoto || false,
      hasAuto: data?.hasAuto || false
    }
  }

  return {
    userCastMemberData,
    loading,
    error,
    getUserCastMemberData,
    setUserCastMemberData,
    deleteUserCastMemberData,
    checkUserCastMemberData
  }
})
