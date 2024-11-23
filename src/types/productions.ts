export interface ThemeColors {
  fromColor: string
  viaColor: string
  toColor: string
}

export interface Production {
  type: 'movie' | 'series' | 'game'
  description: string
  theme: ThemeColors
  imageUrl: string
  title: string
  year: string
  id: string
}

export interface ProductionsList {
  list: Production[]
  loading: boolean
}
