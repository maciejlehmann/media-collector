import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import type { Production, ProductionsList, ThemeColors } from '@/types/productions'
import type { ProductionActor, ProductionCastMembersList } from '@/types/cast'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import type { ProductionCastMemberDocument } from '@/types/firestore'
import { defineStore } from 'pinia'
import { db } from '@/ts/firebase'
import { ref } from 'vue'

const DEFAULT_THEME: ThemeColors = {
  fromColor: 'from-gray-500',
  viaColor: 'via-gray-600',
  toColor: 'to-gray-700'
}

const FALLBACK_THEME: ThemeColors = {
  fromColor: 'from-blue-500',
  viaColor: 'via-indigo-500',
  toColor: 'to-purple-500'
}

export const useProductionsStore = defineStore('productions', () => {
  const productions = ref<ProductionsList>({ list: [], loading: true })
  const productionCastMembers = ref<ProductionCastMembersList>({ list: [], loading: true })

  const convertProduction = (doc: QueryDocumentSnapshot<DocumentData>): Production => {
    const data = doc.data()
    return {
      type: data.type as Production['type'],
      description: data.description,
      imageUrl: data.imageUrl,
      title: data.title,
      year: data.year,
      id: doc.id,
      theme: {
        fromColor: data.theme?.from,
        viaColor: data.theme?.via,
        toColor: data.theme?.to
      }
    }
  }

  const getProductionTheme = (production: Production | undefined): ThemeColors => {
    if (!production) return DEFAULT_THEME
    if (!production.theme) return FALLBACK_THEME

    return {
      fromColor: production.theme.fromColor || FALLBACK_THEME.fromColor,
      viaColor: production.theme.viaColor || FALLBACK_THEME.viaColor,
      toColor: production.theme.toColor || FALLBACK_THEME.toColor
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

  const getProductionCastMembers = async (productionId: string) => {
    try {
      productionCastMembers.value.loading = true

      const productionRef = doc(db, 'productions', productionId)
      const q = query(
        collection(db, 'productionCastMembers'),
        where('productionId', '==', productionRef)
      )

      const querySnapshot = await getDocs(q)

      const castMemberPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data() as ProductionCastMemberDocument
        const castMemberDoc = await getDoc(data.castMemberId)
        const castMemberData = castMemberDoc.data()

        const productionActor: ProductionActor = {
          imageUrl: castMemberData?.imageUrl,
          castMemberId: castMemberDoc.id,
          orderNumber: data.orderNumber,
          name: castMemberData?.name,
          role: data.role,
          id: doc.id
        }

        return productionActor
      })

      productionCastMembers.value.list = await Promise.all(castMemberPromises)
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
    getProductionTheme
  }
})
