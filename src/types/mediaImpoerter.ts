// types/types.ts
import type { DocumentReference } from 'firebase/firestore'

// Base types
interface BaseCastMember {
  id: number
  name: string
  profile_path: string | null
  popularity: number
}

// TMDB API types
export interface TMDBMovieCastMember extends BaseCastMember {
  character: string
  order: number
  media_type: 'movie'
}

export interface TMDBSeriesCastMember extends BaseCastMember {
  roles: Array<{
    character: string
    episode_count: number
  }>
  total_episode_count: number
  media_type: 'series'
}

export type TMDBCastMember = TMDBMovieCastMember | TMDBSeriesCastMember

export interface TMDBMovie {
  id: number
  title: string
  release_date: string
  poster_path: string
}

export interface TMDBSeries {
  id: number
  name: string
  first_air_date: string
  last_air_date: string
  in_production: boolean
  poster_path: string
  number_of_episodes: number
}

export interface TMDBResponse {
  cast: TMDBCastMember[]
}

// Cast filtering types
export interface ProcessedCastMember extends BaseCastMember {
  orderNumber: number
  character: string
  total_episode_count?: number
  roles?: Array<{ character: string; episode_count: number }>
}

export interface CastFilterConfig {
  minimumEpisodes: number
  topCastCount: number
  popularityThreshold: number
}

// Production types
export type MediaType = 'movie' | 'series'

export interface ThemeColors {
  color1: string
  color2: string
  color3: string
  color4: string
  color5: string
  animationDuration?: string
}

export interface Production {
  type: MediaType
  title: string
  year: string
  imageUrl: string
  theme: ThemeColors
}

// Firestore types
export interface ProductionCastMemberDocument {
  productionId: DocumentReference
  castMemberId: DocumentReference
  orderNumber: number
  role: string
}

export interface MovieImportResult {
  movieId: string
  title: string
  year: string
  castCount: number
}

export interface SeriesImportResult {
  seriesId: string
  title: string
  yearRange: string
  castCount: number
  episodeCount: number
}

export interface MovieFilterConfig {
  topCastCount: number
  popularityThreshold: number
  minPopularityForSupporting: number
  maxSupportingCast: number
}

export interface SeriesFilterConfig {
  minimumEpisodes: number
  topCastCount: number
  popularityThreshold: number
  minPopularityForRecurring: number
  maxRecurringCast: number
  maxGuestStars: number
  minPopularityForGuest: number
}

export interface ProcessedCastMember {
  id: number
  name: string
  profile_path: string | null
  popularity: number
  orderNumber: number
  character: string // Główna rola/postać
  total_episode_count?: number // Opcjonalne dla seriali
  roles?: Array<{ // Opcjonalne dla seriali
    character: string
    episode_count: number
  }>
}

// Statystyki dla różnych typów mediów
export interface MovieCastStats {
  mainCastCount: number
  supportingCastCount: number
  totalOriginalCast: number
  totalProcessed: number
  highProfileActorsCount: number
}

export interface SeriesCastStats {
  mainCastCount: number
  recurringCastCount: number
  guestStarsCount: number
  totalOriginalCast: number
  totalProcessed: number
  averageEpisodesPerActor: number
  highProfileGuestsCount: number
}

// Wyniki filtrowania dla różnych typów
export interface MovieCastFilterResult {
  cast: ProcessedCastMember[]
  stats: MovieCastStats
}

export interface SeriesCastFilterResult {
  cast: ProcessedCastMember[]
  stats: SeriesCastStats
}

export type CastFilterResult = MovieCastFilterResult | SeriesCastFilterResult;

export interface CastMemberToSave {
  id: number
  name: string
  profile_path: string | null
  character?: string
  roles?: Array<{ character: string; episode_count: number }>
}
