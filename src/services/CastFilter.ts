import type {
  CastFilterResult,
  MediaType,
  MovieCastFilterResult,
  MovieFilterConfig,
  ProcessedCastMember,
  SeriesCastFilterResult,
  SeriesFilterConfig,
  TMDBCastMember,
  TMDBMovieCastMember,
  TMDBSeriesCastMember
} from '@/types/mediaImpoerter'

export class CastFilter {
  // Konfiguracje domyślne
  private readonly defaultMovieConfig: MovieFilterConfig = {
    topCastCount: 30,
    popularityThreshold: 10,
    minPopularityForSupporting: 5,
    maxSupportingCast: 10
  }

  private getMovieConfig(cast: TMDBMovieCastMember[]): MovieFilterConfig {
    const highProfileActors = cast.filter(member => member.popularity >= 20).length
    const totalCastSize = cast.length

    if (totalCastSize > 100 && highProfileActors > 15) {
      return {
        topCastCount: 50,
        popularityThreshold: 15,
        minPopularityForSupporting: 8,
        maxSupportingCast: 20
      }
    } else if (totalCastSize > 50 || highProfileActors > 10) {
      return {
        topCastCount: 40,
        popularityThreshold: 12,
        minPopularityForSupporting: 6,
        maxSupportingCast: 15
      }
    }
    return this.defaultMovieConfig
  }

  private getSeriesConfig(totalEpisodes: number): SeriesFilterConfig {
    // Bazowa konfiguracja dla długich seriali (>70 odcinków)
    if (totalEpisodes > 70) {
      return {
        minimumEpisodes: Math.ceil(totalEpisodes * 0.1), // 10% odcinków dla głównej obsady
        topCastCount: 50,
        popularityThreshold: 10,
        minPopularityForRecurring: 5,
        maxRecurringCast: 20,
        maxGuestStars: 15,
        minPopularityForGuest: 15 // Wysoki próg popularności dla gości
      }
    }
    // Średnie seriale (30-70 odcinków)
    else if (totalEpisodes > 30) {
      return {
        minimumEpisodes: 3,
        topCastCount: 40,
        popularityThreshold: 8,
        minPopularityForRecurring: 4,
        maxRecurringCast: 15,
        maxGuestStars: 12,
        minPopularityForGuest: 12
      }
    }
    // Krótkie seriale (<30 odcinków)
    return {
      minimumEpisodes: 2,
      topCastCount: 30,
      popularityThreshold: 5,
      minPopularityForRecurring: 3,
      maxRecurringCast: 10,
      maxGuestStars: 10,
      minPopularityForGuest: 10
    }
  }

  private processMovieCastMember(
    member: TMDBMovieCastMember,
    orderNumber: number
  ): ProcessedCastMember {
    return {
      id: member.id,
      name: member.name,
      profile_path: member.profile_path,
      popularity: member.popularity,
      orderNumber,
      character: member.character
    }
  }

  private mapToProcessedCastMember(member: TMDBSeriesCastMember, orderNumber: number): ProcessedCastMember {
    return {
      id: member.id,
      name: member.name,
      profile_path: member.profile_path,
      popularity: member.popularity,
      orderNumber,
      character: member.roles?.[0]?.character || 'Unknown Role',
      total_episode_count: member.total_episode_count,
      roles: member.roles
    }
  }

  private logSeriesCastAnalysis(
    mainCast: TMDBSeriesCastMember[],
    recurringCast: TMDBSeriesCastMember[],
    guestStars: TMDBSeriesCastMember[],
    totalEpisodes: number
  ) {
    console.log('\n📺 Series Cast Analysis:')
    console.log(`Total Episodes: ${totalEpisodes}`)
    console.log('\nCast Breakdown:')
    console.log(`Main Cast: ${mainCast.length} members`)
    console.log(`Recurring Cast: ${recurringCast.length} members`)
    console.log(`Guest Stars: ${guestStars.length} members`)

    if (guestStars.length > 0) {
      console.log('\nNotable Guest Stars:')
      guestStars
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
        .forEach(guest => {
          console.log(
            `- ${guest.name} (Popularity: ${guest.popularity.toFixed(1)}) ` +
            `as "${guest.roles[0]?.character}" in ${guest.total_episode_count} episode(s)`
          )
        })
    }
  }

  private filterMovieCast(cast: TMDBMovieCastMember[]): MovieCastFilterResult {
    const config = this.getMovieConfig(cast)
    const highProfileActors = cast.filter(m => m.popularity >= 20).length

    const sortedCast = [...cast].sort((a, b) => {
      const orderDiff = (a.order || 999) - (b.order || 999)
      if (orderDiff !== 0) return orderDiff
      return b.popularity - a.popularity
    })

    const mainCast = sortedCast.filter((member, index) =>
      (index < config.topCastCount || member.popularity >= config.popularityThreshold) &&
      member.profile_path &&
      member.character
    )

    const supportingCast = sortedCast.filter(member =>
      !mainCast.includes(member) &&
      member.popularity >= config.minPopularityForSupporting &&
      member.profile_path &&
      member.character &&
      !member.character.toLowerCase().includes('uncredited')
    ).slice(0, config.maxSupportingCast)

    const finalCast = [...mainCast, ...supportingCast]
      .map((member, index) => this.processMovieCastMember(member, index + 1))

    return {
      cast: finalCast,
      stats: {
        mainCastCount: mainCast.length,
        supportingCastCount: supportingCast.length,
        totalOriginalCast: cast.length,
        totalProcessed: finalCast.length,
        highProfileActorsCount: highProfileActors
      }
    }
  }

  private filterSeriesCast(
    cast: TMDBSeriesCastMember[],
    totalEpisodes: number
  ): SeriesCastFilterResult {
    const config = this.getSeriesConfig(totalEpisodes)

    const sortedCast = [...cast].sort((a, b) => {
      const episodeDiff = (b.total_episode_count || 0) - (a.total_episode_count || 0)
      if (episodeDiff !== 0) return episodeDiff
      return b.popularity - a.popularity
    })

    // Główna obsada - regularne występy
    const mainCast = sortedCast.filter(member =>
      member.total_episode_count >= config.minimumEpisodes &&
      member.profile_path &&
      member.roles?.[0]?.character
    ).slice(0, config.topCastCount)

    // Obsada powracająca - mniej odcinków, ale wciąż znaczące role
    const recurringCast = sortedCast.filter(member =>
      !mainCast.includes(member) &&
      member.total_episode_count > 0 &&
      member.popularity >= config.popularityThreshold &&
      member.roles?.[0]?.character &&
      member.profile_path
    ).slice(0, config.maxRecurringCast)

    // Gościnne występy - znani aktorzy w pojedynczych odcinkach
    const guestStars = sortedCast.filter(member =>
      !mainCast.includes(member) &&
      !recurringCast.includes(member) &&
      ((member.popularity >= config.minPopularityForGuest) ||
        (member.popularity >= config.minPopularityForRecurring &&
          member.roles?.[0]?.character &&
          !member.roles[0].character.toLowerCase().includes('uncredited') &&
          !member.roles[0].character.toLowerCase().includes('background'))) &&
      member.profile_path
    ).slice(0, config.maxGuestStars)

    // Mapowanie na ProcessedCastMember
    const finalCast = [...mainCast, ...recurringCast, ...guestStars]
      .map((member, index) => this.mapToProcessedCastMember(member, index + 1))

    const highProfileGuests = guestStars.filter(member =>
      member.popularity >= config.minPopularityForGuest
    ).length

    const averageEpisodes = finalCast.reduce((sum, member) =>
      sum + (member.total_episode_count || 0), 0) / finalCast.length

    this.logSeriesCastAnalysis(mainCast, recurringCast, guestStars, totalEpisodes)

    return {
      cast: finalCast,
      stats: {
        mainCastCount: mainCast.length,
        recurringCastCount: recurringCast.length,
        guestStarsCount: guestStars.length,
        highProfileGuestsCount: highProfileGuests,
        totalOriginalCast: cast.length,
        totalProcessed: finalCast.length,
        averageEpisodesPerActor: Math.round(averageEpisodes * 10) / 10
      }
    }
  }

  public filterCastMembers(
    cast: TMDBCastMember[],
    mediaType: MediaType,
    totalEpisodes?: number
  ): CastFilterResult {
    if (mediaType === 'movie') {
      return this.filterMovieCast(cast as TMDBMovieCastMember[])
    }
    if (!totalEpisodes) {
      throw new Error('Total episodes count is required for series cast filtering')
    }
    return this.filterSeriesCast(cast as TMDBSeriesCastMember[], totalEpisodes)
  }
}
