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
