import { CastFilter } from '@/services/CastFilter'
import type {
  MediaType,
  MovieCastFilterResult,
  MovieImportResult,
  ProcessedCastMember,
  SeriesCastFilterResult,
  SeriesImportResult,
  ThemeColors,
  TMDBMovie,
  TMDBResponse,
  TMDBSeries
} from '@/types/mediaImpoerter'
import { doc, type DocumentReference, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/ts/firebase'

interface SearchResult {
  id: number
  title: string
  type: MediaType
  year: string
  imageUrl: string | null
}

export class MediaImporter {
  private readonly baseURL = 'https://api.themoviedb.org/3'
  private readonly imageBaseURL = 'https://image.tmdb.org/t/p/w500'
  private readonly options: RequestInit
  private readonly castFilter: CastFilter

  constructor() {
    this.options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYWRkMTliZWUwMTcyYTBhMjljMTg5ZWQwNjdlODQ4YyIsIm5iZiI6MTczMjM4Nzk2My4xMzUwNzM0LCJzdWIiOiI2NTY0ZGRlODcwNmU1NjAwZTE1NDZjMzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.XnFog3NRrooG2hV4skF_jcUors14IAcZZH_QpAUonAU'
      }
    }
    this.castFilter = new CastFilter()
  }

  private getEmptyTheme(): ThemeColors {
    return {
      color1: '',
      color2: '',
      color3: '',
      color4: '',
      color5: '',
      animationDuration: '12s'
    }
  }

  // Metody dla filmów
  private async fetchMovie(movieId: number): Promise<TMDBMovie> {
    const response = await fetch(
      `${this.baseURL}/movie/${movieId}?language=en-US`,
      this.options
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch movie: ${response.statusText}`)
    }
    return response.json()
  }

  private async fetchMovieCredits(movieId: number): Promise<TMDBResponse> {
    const response = await fetch(
      `${this.baseURL}/movie/${movieId}/credits?language=en-US`,
      this.options
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch movie credits: ${response.statusText}`)
    }
    return response.json()
  }

  private formatMovieYear(releaseDate: string): string {
    return releaseDate?.substring(0, 4) || 'Unknown Year'
  }

  private async saveMovieDocument(movieId: string, movie: TMDBMovie) {
    if (!movie.title) {
      throw new Error('Movie title is required')
    }

    const movieDoc = {
      type: 'movie' as MediaType,
      title: movie.title,
      year: this.formatMovieYear(movie.release_date),
      imageUrl: movie.poster_path ? this.imageBaseURL + movie.poster_path : '/placeholder.jpg',
      theme: this.getEmptyTheme()
    }

    const movieRef = doc(db, 'productions', movieId)
    await setDoc(movieRef, movieDoc)
    return movieRef
  }

  // Metody dla seriali
  private async fetchSeries(seriesId: number): Promise<TMDBSeries> {
    const response = await fetch(
      `${this.baseURL}/tv/${seriesId}?language=en-US`,
      this.options
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch series: ${response.statusText}`)
    }
    return response.json()
  }

  private async fetchSeriesCredits(seriesId: number): Promise<TMDBResponse> {
    const response = await fetch(
      `${this.baseURL}/tv/${seriesId}/aggregate_credits?language=en-US`,
      this.options
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch series credits: ${response.statusText}`)
    }
    return response.json()
  }

  private formatSeriesYear(series: TMDBSeries): string {
    const startYear = series.first_air_date?.substring(0, 4) || 'Unknown'
    if (!series.last_air_date) {
      return series.in_production ? `${startYear}-` : startYear
    }
    const endYear = series.last_air_date.substring(0, 4)
    return startYear === endYear ? startYear : `${startYear}-${endYear}`
  }

  private async saveSeriesDocument(seriesId: string, series: TMDBSeries) {
    if (!series.name) {
      throw new Error('Series name is required')
    }

    const seriesDoc = {
      type: 'series' as MediaType,
      title: series.name,
      year: this.formatSeriesYear(series),
      imageUrl: series.poster_path ? this.imageBaseURL + series.poster_path : '/placeholder.jpg',
      theme: this.getEmptyTheme()
    }

    const seriesRef = doc(db, 'productions', seriesId)
    await setDoc(seriesRef, seriesDoc)
    return seriesRef
  }

  private async saveCastMember(
    castMember: ProcessedCastMember,
    productionRef: DocumentReference,
    productionId: string,
    orderNumber: number
  ) {
    const castMemberRef = doc(db, 'castMembers', String(castMember.id))

    // Sprawdź wymagane pola
    if (!castMember.name) {
      console.warn(`Missing name for cast member ID: ${castMember.id}`)
      return
    }

    // Zapisz aktora
    await setDoc(castMemberRef, {
      name: castMember.name,
      imageUrl: castMember.profile_path
        ? this.imageBaseURL + castMember.profile_path
        : '/placeholder-actor.jpg'
    }, { merge: true })

    // Określ rolę
    const role = castMember.roles?.[0]?.character || castMember.character || 'Unknown Role'

    const productionCastMemberDoc = {
      productionId: productionRef,
      castMemberId: castMemberRef,
      role,
      orderNumber
    }

    const productionCastMemberId = `${productionId}_${castMember.id}`
    await setDoc(
      doc(db, 'productionCastMembers', productionCastMemberId),
      productionCastMemberDoc
    )
  }

  public async importMovie(movieId: number): Promise<MovieImportResult> {
    try {
      console.log(`🎬 Starting import of movie with ID: ${movieId}`)

      const movieData = await this.fetchMovie(movieId)
      const formattedMovieId = `movie-${movieId}`
      console.log(`✅ Movie data fetched successfully: ${movieData.title}`)

      const movieRef = await this.saveMovieDocument(formattedMovieId, movieData)

      const creditsData = await this.fetchMovieCredits(movieId)
      console.log(`✅ Cast data fetched successfully: ${creditsData.cast.length} members`)

      const filteredData = this.castFilter.filterCastMembers(
        creditsData.cast,
        'movie'
      ) as MovieCastFilterResult

      // Zapisz aktorów
      const savePromises = filteredData.cast.map((castMember, index) =>
        this.saveCastMember(castMember, movieRef, formattedMovieId, index + 1)
      )
      await Promise.all(savePromises)

      console.log(`✅ Saved ${filteredData.stats.mainCastCount} main cast and ${filteredData.stats.supportingCastCount} supporting cast members`)

      return {
        movieId: formattedMovieId,
        title: movieData.title,
        year: this.formatMovieYear(movieData.release_date),
        castCount: filteredData.cast.length
      }
    } catch (error) {
      console.error('❌ Error importing movie:', error)
      throw error
    }
  }

  public async importSeries(seriesId: number): Promise<SeriesImportResult> {
    try {
      console.log(`📺 Starting import of series with ID: ${seriesId}`)

      const seriesData = await this.fetchSeries(seriesId)
      const formattedSeriesId = `series-${seriesId}`
      console.log(`✅ Series data fetched successfully: ${seriesData.name}`)

      const seriesRef = await this.saveSeriesDocument(formattedSeriesId, seriesData)

      const creditsData = await this.fetchSeriesCredits(seriesId)
      console.log(`✅ Cast data fetched successfully: ${creditsData.cast.length} members`)

      const filteredData = this.castFilter.filterCastMembers(
        creditsData.cast,
        'series',
        seriesData.number_of_episodes
      ) as SeriesCastFilterResult

      // Zapisz aktorów
      const savePromises = filteredData.cast.map((castMember, index) =>
        this.saveCastMember(castMember, seriesRef, formattedSeriesId, index + 1)
      )
      await Promise.all(savePromises)

      console.log(`✅ Saved ${filteredData.stats.mainCastCount} main cast, ${filteredData.stats.recurringCastCount} recurring cast, and ${filteredData.stats.guestStarsCount} guest stars`)

      return {
        seriesId: formattedSeriesId,
        title: seriesData.name,
        yearRange: this.formatSeriesYear(seriesData),
        castCount: filteredData.cast.length,
        episodeCount: seriesData.number_of_episodes
      }
    } catch (error) {
      console.error('❌ Error importing series:', error)
      throw error
    }
  }

  public async searchMedia(query: string): Promise<SearchResult[]> {
    const response = await fetch(
      `${this.baseURL}/search/multi?query=${encodeURIComponent(query)}&language=en-US`,
      this.options
    )
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    const data = await response.json()

    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        id: item.id,
        title: item.media_type === 'movie' ? item.title : item.name,
        type: item.media_type === 'movie' ? 'movie' : 'series',
        year: item.media_type === 'movie'
          ? item.release_date?.substring(0, 4) || 'Unknown'
          : `${item.first_air_date?.substring(0, 4) || 'Unknown'}${
            item.in_production ? '-' : item.last_air_date ? `-${item.last_air_date.substring(0, 4)}` : ''
          }`,
        imageUrl: item.poster_path ? this.imageBaseURL + item.poster_path : null
      }))
  }

  public async updateTheme(mediaId: string, theme: ThemeColors) {
    try {
      console.log(`🎨 Updating theme for ${mediaId}...`)
      const productionRef = doc(db, 'productions', mediaId)
      await updateDoc(productionRef, { theme })
      console.log(`✅ Theme updated successfully for ${mediaId}:`, theme)
    } catch (error) {
      console.error(`❌ Error updating theme for ${mediaId}:`, error)
      throw error
    }
  }

  public async updateThemes(themes: Record<string, ThemeColors>) {
    console.log(`🎨 Starting batch theme update for ${Object.keys(themes).length} productions...`)

    const updatePromises = Object.entries(themes).map(([mediaId, theme]) => {
      console.log(`📝 Queuing update for ${mediaId}`)
      return this.updateTheme(mediaId, theme)
    })

    try {
      await Promise.all(updatePromises)
      console.log('✅ All themes updated successfully')
    } catch (error) {
      console.error('❌ Error updating themes:', error)
      throw error
    }
  }
}
