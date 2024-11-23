export interface ProductionActor {
  castMemberId: string
  orderNumber: number
  imageUrl: string
  name: string
  role: string
  id: string
}

export interface ProductionCastMembersList {
  list: ProductionActor[]
  loading: boolean
}
