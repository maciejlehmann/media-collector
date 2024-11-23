import type { DocumentReference, Timestamp } from 'firebase/firestore'

export interface ProductionCastMemberDocument {
  productionId: DocumentReference
  castMemberId: DocumentReference
  orderNumber: number
  role: string
}

export interface FirestoreUserCastMemberData {
  castMemberId: string
  updatedAt: Timestamp
  hasPhoto: boolean
  hasAuto: boolean
  userId: string
}
