export interface ThemeColors {
  color1: string
  color2: string
  color3: string
  color4: string
  color5: string
  animationDuration?: string
}

export interface Production {
  type: 'movie' | 'series'
  imageUrl: string
  title: string
  year: string
  id: string
  theme: ThemeColors
}

export interface ProductionsList {
  list: Production[]
  loading: boolean
}
