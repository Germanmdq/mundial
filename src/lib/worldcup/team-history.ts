import { FIFA_TEAM_PROFILES } from '@/data/fifa-team-profiles'

export function getFifaTeamProfile(teamSlug: string | null | undefined) {
  if (!teamSlug) return null
  return FIFA_TEAM_PROFILES[teamSlug] ?? null
}

export function getTeamHistorySummary(teamSlug: string | null | undefined): string | null {
  const profile = getFifaTeamProfile(teamSlug)
  return profile?.shortHistorySummary ?? profile?.iconicMomentsSummary ?? null
}

export function getTeamWorldCupStats(teamSlug: string | null | undefined) {
  const profile = getFifaTeamProfile(teamSlug)
  if (!profile) return null

  return {
    appearancesCount: profile.appearancesCount ?? null,
    appearancesYears: profile.appearancesYears ?? [],
    bestResult: profile.bestResult ?? null,
    bestResultYears: profile.bestResultYears ?? [],
    firstWorldCup: profile.firstWorldCup ?? null,
    lastWorldCup: profile.lastWorldCup ?? null,
    lastWorldCupResult: profile.lastWorldCupResult ?? null,
    record: profile.record ?? null,
  }
}
