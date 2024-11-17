import { defineStore } from 'pinia'
import { db } from '@/ts/firebase'
import { ref } from 'vue'
import type { Production, ProductionCastMembersList, ProductionsList } from '@/types/types'
import type { DocumentData, DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'

export const useProductionsStore = defineStore('productions', () => {
  const productions = ref<ProductionsList>({ list: [], loading: true })
  const convertProduction = (doc: QueryDocumentSnapshot<DocumentData>): Production => {
    const data = doc.data()
    return {
      type: data.type as Production['type'],
      description: data.description,
      imageUrl: data.imageUrl,
      title: data.title,
      year: data.year,
      id: doc.id,
    }
  }

  const getProductions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productions'))
      productions.value.list = querySnapshot.docs.map(convertProduction)
    } catch (error) {
      console.error('Error fetching productions:', error)
    } finally {
      productions.value.loading = false
    }
  }

  const productionCastMembers = ref<ProductionCastMembersList>({ list: [], loading: true })
  const getProductionCastMembers = async (productionId: string) => {
    try {
      productionCastMembers.value.loading = true

      const productionRef = doc(db, 'productions', productionId)
      const q = query(collection(db, 'productionCastMembers'), where('productionId', '==', productionRef))
      const querySnapshot = await getDocs(q)

      const castMemberPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data()

        const castMemberDoc = await getDoc(data.castMemberId as DocumentReference)
        const castMemberData = castMemberDoc.data()

        return {
          hasPhoto: castMemberData?.hasPhoto,
          imageUrl: castMemberData?.imageUrl,
          hasAuto: castMemberData?.hasAuto,
          castMemberId: castMemberDoc.id,
          orderNumber: data.orderNumber,
          name: castMemberData?.name,
          role: data.role,
          id: doc.id,
        }
      })

      const results = await Promise.all(castMemberPromises)

      productionCastMembers.value.list = results

      productionCastMembers.value.list.sort((a, b) => a.orderNumber - b.orderNumber)
    } catch (error) {
      console.error('Error fetching production cast members:', error)
    } finally {
      productionCastMembers.value.loading = false
    }
  }

  return {
    productions,
    getProductions,
    productionCastMembers,
    getProductionCastMembers,
  }
})
