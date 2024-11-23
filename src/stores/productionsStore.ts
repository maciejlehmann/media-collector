import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import type { Production, ProductionsList, ThemeColors } from '@/types/productions'
import type { ProductionActor, ProductionCastMembersList } from '@/types/cast'
import type { ProductionCastMemberDocument } from '@/types/firestore'
import { defineStore } from 'pinia'
import { db } from '@/ts/firebase'
import { ref } from 'vue'

const DEFAULT_THEME: ThemeColors = {
  color1: '#6B7280', // gray-500
  color2: '#4B5563', // gray-600
  color3: '#374151', // gray-700
  color4: '#4B5563', // gray-600
  color5: '#6B7280', // gray-500
  animationDuration: '12s'
}

const FALLBACK_THEME: ThemeColors = {
  color1: '#3B82F6', // blue-500
  color2: '#6366F1', // indigo-500
  color3: '#A855F7', // purple-500
  color4: '#6366F1', // indigo-500
  color5: '#3B82F6', // blue-500
  animationDuration: '12s'
}

export const useProductionsStore = defineStore('productions', () => {
  const productions = ref<ProductionsList>({ list: [], loading: true })
  const productionCastMembers = ref<ProductionCastMembersList>({ list: [], loading: true })

  const convertProduction = (doc: QueryDocumentSnapshot<DocumentData>): Production => {
    const data = doc.data()
    return {
      type: data.type as Production['type'],
      imageUrl: data.imageUrl,
      title: data.title,
      year: data.year,
      id: doc.id,
      theme: {
        color1: data.theme?.color1,
        color2: data.theme?.color2,
        color3: data.theme?.color3,
        color4: data.theme?.color4,
        color5: data.theme?.color5,
        animationDuration: data.theme?.animationDuration
      }
    }
  }

  const getProductionTheme = (production: Production | undefined): ThemeColors => {
    if (!production) return DEFAULT_THEME
    if (!production.theme) return FALLBACK_THEME

    return {
      color1: production.theme.color1 || FALLBACK_THEME.color1,
      color2: production.theme.color2 || FALLBACK_THEME.color2,
      color3: production.theme.color3 || FALLBACK_THEME.color3,
      color4: production.theme.color4 || FALLBACK_THEME.color4,
      color5: production.theme.color5 || FALLBACK_THEME.color5,
      animationDuration: production.theme.animationDuration || FALLBACK_THEME.animationDuration
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
