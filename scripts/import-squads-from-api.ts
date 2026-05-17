import { getApiFootballConfig, getTheSportsDbConfig } from '../src/lib/worldcup/external-api-config'
import { matchPlayerByNameAndTeam, slugifyPlayerName } from '../src/lib/worldcup/player-matching'
import { CsvRow, getAnonSupabaseRows, loadEnvLocal, readCsv, todayIsoDate, writeCsv } from './api-import-utils'

const INPUT = 'supabase/import/external_team_mappings.csv'
const OUTPUT = 'supabase/import/api_players_review.csv'
const HEADERS = ['provider', 'provider_player_id', 'team_slug', 'team_id', 'name', 'slug', 'shirt_number', 'position', 'club', 'date_of_birth', 'nationality', 'photo_url_external', 'photo_local_path', 'photo_storage_path', 'source_url', 'last_verified_at', 'status', 'match_status', 'notes']

type ApiFootballSquadPlayer = {
  id?: string | number
  name?: string
  number?: string | number
  position?: string
  photo?: string
}

type TheSportsDbPlayer = {
  idPlayer?: string
  strPlayer?: string
  strNumber?: string
  strPosition?: string
  strTeam?: string
  dateBorn?: string
  strNationality?: string
  strCutout?: string
  strThumb?: string
}

type TeamRow = {
  id: string | number
  slug: string
  name?: string
}

type ExistingPlayerRow = {
  id?: string | number | null
  team_id?: string | number | null
  name?: string | null
  display_name?: string | null
  slug?: string | null
  team_slug?: string | null
}

async function fetchApiFootballSquad(teamId: string): Promise<CsvRow[]> {
  const config = getApiFootballConfig()
  if (!config.enabled || !teamId) return []
  const response = await fetch(`${config.baseUrl}/players/squads?team=${encodeURIComponent(teamId)}`, { headers: config.headers })
  if (!response.ok) return []
  const json = await response.json()
  const players = (json.response?.[0]?.players ?? []) as ApiFootballSquadPlayer[]
  return players.map((item) => ({
    provider: 'api-football',
    provider_player_id: String(item.id ?? ''),
    name: item.name ?? '',
    slug: slugifyPlayerName(item.name ?? ''),
    shirt_number: String(item.number ?? ''),
    position: item.position ?? '',
    club: '',
    date_of_birth: '',
    nationality: '',
    photo_url_external: item.photo ?? '',
    source_url: `${config.baseUrl}/players/squads?team=${teamId}`,
  }))
}

async function fetchTheSportsDbPlayers(teamId: string): Promise<CsvRow[]> {
  const config = getTheSportsDbConfig()
  if (!config.enabled || !teamId) return []
  const response = await fetch(`${config.baseUrl}/lookup_all_players.php?id=${encodeURIComponent(teamId)}`)
  if (!response.ok) return []
  const json = await response.json()
  return ((json.player ?? []) as TheSportsDbPlayer[]).map((item) => ({
    provider: 'thesportsdb',
    provider_player_id: String(item.idPlayer ?? ''),
    name: item.strPlayer ?? '',
    slug: slugifyPlayerName(item.strPlayer ?? ''),
    shirt_number: String(item.strNumber ?? ''),
    position: item.strPosition ?? '',
    club: item.strTeam ?? '',
    date_of_birth: item.dateBorn ?? '',
    nationality: item.strNationality ?? '',
    photo_url_external: item.strCutout ?? item.strThumb ?? '',
    source_url: `${config.baseUrl}/lookup_all_players.php?id=${teamId}`,
  }))
}

async function main() {
  await loadEnvLocal()
  const mappings = await readCsv(INPUT)
  const teams = await getAnonSupabaseRows('teams_info', 'id,slug,name')
  const existingPlayersRaw = await getAnonSupabaseRows('players_info', 'id,team_id,name,display_name,slug')
  const typedTeams = teams as unknown as TeamRow[]
  const teamsBySlug = new Map(typedTeams.map((team) => [team.slug, team]))
  const teamsById = new Map(typedTeams.map((team) => [String(team.id), team]))
  const existingPlayers = (existingPlayersRaw as unknown as ExistingPlayerRow[]).map((player) => ({
    ...player,
    team_slug: teamsById.get(String(player.team_id))?.slug ?? null,
  }))
  const output: CsvRow[] = []

  for (const mapping of mappings) {
    const teamSlug = mapping.team_slug
    const team = teamsBySlug.get(teamSlug)
    if (!teamSlug || !team) continue

    const players = [
      ...(await fetchApiFootballSquad(mapping.api_football_team_id)),
      ...(await fetchTheSportsDbPlayers(mapping.thesportsdb_team_id)),
    ]

    for (const player of players) {
      if (!player.name) continue
      const match = matchPlayerByNameAndTeam({ name: player.name, slug: player.slug, team_slug: teamSlug }, existingPlayers)
      output.push({
        provider: player.provider,
        provider_player_id: player.provider_player_id,
        team_slug: teamSlug,
        team_id: String(team.id),
        name: player.name,
        slug: player.slug || slugifyPlayerName(player.name),
        shirt_number: player.shirt_number,
        position: player.position,
        club: player.club,
        date_of_birth: player.date_of_birth,
        nationality: player.nationality,
        photo_url_external: player.photo_url_external,
        photo_local_path: '',
        photo_storage_path: player.slug ? `players/${teamSlug}/${player.slug}.webp` : '',
        source_url: player.source_url,
        last_verified_at: todayIsoDate(),
        status: 'pending_review',
        match_status: match.status,
        notes: match.player ? `matched_player_id=${match.player.id}; confidence=${match.confidence}` : `confidence=${match.confidence}`,
      })
    }
  }

  await writeCsv(OUTPUT, HEADERS, output)
  console.log(`Jugadores API guardados en ${OUTPUT}: ${output.length}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
