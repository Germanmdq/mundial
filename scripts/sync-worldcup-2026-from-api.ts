import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getApiFootballConfig, getTheSportsDbConfig } from '../src/lib/worldcup/external-api-config'
import { matchPlayerByNameAndTeam, slugifyPlayerName } from '../src/lib/worldcup/player-matching'
import {
  convertImageToWebp,
  downloadToBuffer,
  getAdminSupabaseClient,
  getAnonSupabaseRows,
  loadEnvLocal,
  slugify,
  todayIsoDate,
  writeCsv,
  type CsvRow,
} from './api-import-utils'

const LEAGUE = '1'
const SEASON = '2026'
const CACHE_DIR = 'supabase/import/api-cache/worldcup-2026'
const TEAM_REVIEW_CSV = 'supabase/import/api_worldcup_teams_review.csv'
const MATCH_REVIEW_CSV = 'supabase/import/api_worldcup_matches_review.csv'
const PLAYER_REVIEW_CSV = 'supabase/import/api_worldcup_players_review.csv'
const REPORT_PATH = 'supabase/reports/worldcup_2026_api_sync_report.md'
const SOURCE_STRATEGY_PATH = 'supabase/reports/source_strategy.md'
const BUCKET = 'worldcup-assets'

type ApiFootballTeamItem = {
  team?: {
    id?: number
    name?: string
    code?: string | null
    country?: string | null
    logo?: string | null
  }
}

type ApiFootballFixtureItem = {
  fixture?: {
    id?: number
    date?: string | null
    venue?: {
      name?: string | null
      city?: string | null
    }
    status?: {
      short?: string | null
      long?: string | null
    }
  }
  league?: {
    round?: string | null
  }
  teams?: {
    home?: { id?: number; name?: string | null; logo?: string | null }
    away?: { id?: number; name?: string | null; logo?: string | null }
  }
}

type ApiFootballSquadItem = {
  team?: { id?: number; name?: string | null }
  players?: Array<{
    id?: number
    name?: string | null
    age?: number | null
    number?: number | null
    position?: string | null
    photo?: string | null
  }>
}

type ApiFootballEnvelope<T> = {
  response?: T[]
  errors?: unknown
}

type TeamRow = {
  id: string | number
  name: string | null
  slug: string | null
  fifa_code?: string | null
}

type MatchRow = {
  id: string | number
  match_number?: number | null
  home_team?: string | null
  away_team?: string | null
  kickoff_at?: string | null
  stadium_name?: string | null
}

type PlayerRow = {
  id: string | number
  team_id?: string | number | null
  name?: string | null
  display_name?: string | null
  slug?: string | null
  team_slug?: string | null
}

type TeamMatch = {
  team: TeamRow | null
  confidence: number
  status: 'matched' | 'unmatched' | 'ambiguous'
}

type SyncStats = {
  apiKeyPresent: boolean
  serviceRolePresent: boolean
  teamsObtained: number
  teamsMatched: number
  teamsUnmatched: number
  teamsAmbiguous: number
  fixturesObtained: number
  matchesUpdated: number
  squadsObtained: number
  playersMatched: number
  playersNewPending: number
  playersAmbiguous: number
  playersNoTeamMatch: number
  logosDownloaded: number
  photosDownloaded: number
  assetsUploaded: number
  playersUpdated: number
  errors: string[]
}

function apiUrl(pathname: string, params: Record<string, string>) {
  const config = getApiFootballConfig()
  const url = new URL(`${config.baseUrl}${pathname}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return { url: url.toString(), headers: config.headers }
}

async function fetchApiFootball<T>(pathname: string, params: Record<string, string>): Promise<T[]> {
  const { url, headers } = apiUrl(pathname, params)
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`API-Football ${response.status} en ${pathname}`)
  const json = (await response.json()) as ApiFootballEnvelope<T>
  return json.response ?? []
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

export async function fetchWorldCupTeams() {
  return fetchApiFootball<ApiFootballTeamItem>('/teams', { league: LEAGUE, season: SEASON })
}

export async function fetchWorldCupFixtures() {
  return fetchApiFootball<ApiFootballFixtureItem>('/fixtures', { league: LEAGUE, season: SEASON })
}

export async function fetchWorldCupStandings() {
  return fetchApiFootball<unknown>('/standings', { league: LEAGUE, season: SEASON })
}

export async function fetchWorldCupSquads(teams: ApiFootballTeamItem[]) {
  const squads: ApiFootballSquadItem[] = []
  for (const item of teams) {
    const teamId = item.team?.id
    if (!teamId) continue
    const response = await fetchApiFootball<ApiFootballSquadItem>('/players/squads', { team: String(teamId) })
    squads.push(...response)
  }
  return squads
}

export function fetchTeamLogo(team: ApiFootballTeamItem): string | null {
  return team.team?.logo ?? null
}

export async function fetchPlayerPhotoFallback(playerName: string): Promise<string | null> {
  const config = getTheSportsDbConfig()
  if (!config.enabled || !playerName.trim()) return null
  const url = new URL(`${config.baseUrl}/searchplayers.php`)
  url.searchParams.set('p', playerName)
  try {
    const response = await fetch(url.toString())
    if (!response.ok) return null
    const json = (await response.json()) as { player?: Array<{ strCutout?: string | null; strThumb?: string | null }> }
    const first = json.player?.[0]
    return first?.strCutout ?? first?.strThumb ?? null
  } catch {
    return null
  }
}

function normalize(value: string | null | undefined): string {
  return slugify(value).replace(/-/g, ' ')
}

function matchTeam(apiTeam: ApiFootballTeamItem, teams: TeamRow[]): TeamMatch {
  const apiName = normalize(apiTeam.team?.name)
  const apiCountry = normalize(apiTeam.team?.country)
  const apiCode = apiTeam.team?.code?.toLowerCase() ?? ''
  const scored = teams
    .map((team) => {
      const nameScore = normalize(team.name) === apiName ? 100 : normalize(team.slug) === apiName ? 94 : 0
      const countryScore = apiCountry && normalize(team.name) === apiCountry ? 96 : 0
      const codeScore = apiCode && team.fifa_code?.toLowerCase() === apiCode ? 100 : 0
      return { team, confidence: Math.max(nameScore, countryScore, codeScore) }
    })
    .filter((item) => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)

  if (scored.length === 0) return { team: null, confidence: 0, status: 'unmatched' }
  if (scored.length > 1 && scored[0].confidence === scored[1].confidence) {
    return { team: null, confidence: scored[0].confidence, status: 'ambiguous' }
  }
  return { team: scored[0].team, confidence: scored[0].confidence, status: scored[0].confidence >= 90 ? 'matched' : 'unmatched' }
}

function matchFixture(apiFixture: ApiFootballFixtureItem, matches: MatchRow[]) {
  const home = normalize(apiFixture.teams?.home?.name)
  const away = normalize(apiFixture.teams?.away?.name)
  const date = apiFixture.fixture?.date?.slice(0, 10) ?? ''
  const scored = matches
    .map((match) => {
      const teamsMatch = normalize(match.home_team) === home && normalize(match.away_team) === away
      const dateMatch = date && match.kickoff_at?.slice(0, 10) === date
      return { match, confidence: teamsMatch && dateMatch ? 98 : teamsMatch ? 88 : 0 }
    })
    .filter((item) => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)

  if (scored.length === 0) return { match: null, confidence: 0 }
  if (scored.length > 1 && scored[0].confidence === scored[1].confidence) return { match: null, confidence: scored[0].confidence }
  return scored[0]
}

function buildPublicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${storagePath}` : ''
}

async function uploadTeamLogo(teamSlug: string, logoUrl: string, teamId: string | number, stats: SyncStats) {
  const buffer = await downloadToBuffer(logoUrl)
  const localPath = `assets/worldcup-assets/teams/${teamSlug}/crest.webp`
  const publicPath = `public/worldcup-assets/teams/${teamSlug}/crest.webp`
  await convertImageToWebp(buffer, localPath, publicPath, 800, 800)
  stats.logosDownloaded += 1

  const admin = getAdminSupabaseClient()
  if (!admin) return
  const storagePath = `teams/${teamSlug}/crest.webp`
  const file = await import('node:fs/promises').then((fs) => fs.readFile(localPath))
  const upload = await admin.storage.from(BUCKET).upload(storagePath, file, { contentType: 'image/webp', upsert: true })
  if (upload.error) throw upload.error
  stats.assetsUploaded += 1

  const publicUrl = buildPublicUrl(storagePath)
  const update = await admin
    .from('team_assets')
    .upsert(
      {
        team_id: teamId,
        asset_type: 'crest',
        storage_path: storagePath,
        url: publicUrl,
        is_primary: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'team_id,asset_type' },
    )
  if (update.error) throw update.error
}

async function preparePlayerPhoto(row: CsvRow, stats: SyncStats) {
  const externalUrl = row.photo_url_external
  const teamSlug = row.team_slug
  const playerSlug = row.slug
  const playerId = row.matched_player_id
  if (!externalUrl || !teamSlug || !playerSlug) return
  const buffer = await downloadToBuffer(externalUrl)
  const localPath = `assets/worldcup-assets/players/${teamSlug}/${playerSlug}.webp`
  const publicPath = `public/worldcup-assets/players/${teamSlug}/${playerSlug}.webp`
  await convertImageToWebp(buffer, localPath, publicPath, 800, 1000)
  stats.photosDownloaded += 1

  const admin = getAdminSupabaseClient()
  if (!admin || !playerId) return
  const storagePath = `players/${teamSlug}/${playerSlug}.webp`
  const file = await import('node:fs/promises').then((fs) => fs.readFile(localPath))
  const upload = await admin.storage.from(BUCKET).upload(storagePath, file, { contentType: 'image/webp', upsert: true })
  if (upload.error) throw upload.error
  stats.assetsUploaded += 1

  const update = await admin
    .from('players_info')
    .update({
      photo_storage_path: storagePath,
      photo_url: buildPublicUrl(storagePath),
      updated_at: new Date().toISOString(),
    })
    .eq('id', playerId)
  if (update.error) throw update.error
  stats.playersUpdated += 1
}

function buildReport(stats: SyncStats) {
  return `# World Cup 2026 API sync report

- Fecha: ${new Date().toISOString()}
- Fuente principal: API-Football / API-SPORTS
- League: ${LEAGUE}
- Season: ${SEASON}
- API key presente: ${stats.apiKeyPresent ? 'si' : 'no'}
- Service role presente: ${stats.serviceRolePresent ? 'si' : 'no'}

## Resultados

- Equipos obtenidos: ${stats.teamsObtained}
- Equipos matched: ${stats.teamsMatched}
- Equipos unmatched: ${stats.teamsUnmatched}
- Equipos ambiguous: ${stats.teamsAmbiguous}
- Fixtures obtenidos: ${stats.fixturesObtained}
- Partidos actualizados: ${stats.matchesUpdated}
- Squads obtenidos: ${stats.squadsObtained}
- Jugadores matched: ${stats.playersMatched}
- Jugadores nuevos pending_review: ${stats.playersNewPending}
- Jugadores ambiguous: ${stats.playersAmbiguous}
- Jugadores sin match de equipo: ${stats.playersNoTeamMatch}
- Logos descargados: ${stats.logosDownloaded}
- Fotos descargadas: ${stats.photosDownloaded}
- Assets subidos a Supabase: ${stats.assetsUploaded}
- Players actualizados: ${stats.playersUpdated}

## Archivos generados

- Cache: \`${CACHE_DIR}/\`
- Equipos review: \`${TEAM_REVIEW_CSV}\`
- Matches review: \`${MATCH_REVIEW_CSV}\`
- Players review: \`${PLAYER_REVIEW_CSV}\`

## Errores

${stats.errors.length > 0 ? stats.errors.map((error) => `- ${error}`).join('\n') : '- Sin errores.'}

## Proximos pasos

${stats.apiKeyPresent ? '- Revisar los CSV generados antes de confiar los cambios al frontend.' : '- Cargar API_FOOTBALL_KEY para traer datos reales del Mundial 2026.'}
${stats.serviceRolePresent ? '- Revisar assets subidos y registros actualizados en Supabase.' : '- Cargar SUPABASE_SERVICE_ROLE_KEY para subir assets y actualizar Supabase desde el script admin.'}
`
}

async function main() {
  await loadEnvLocal()
  const apiConfig = getApiFootballConfig()
  const stats: SyncStats = {
    apiKeyPresent: apiConfig.enabled,
    serviceRolePresent: Boolean(getAdminSupabaseClient()),
    teamsObtained: 0,
    teamsMatched: 0,
    teamsUnmatched: 0,
    teamsAmbiguous: 0,
    fixturesObtained: 0,
    matchesUpdated: 0,
    squadsObtained: 0,
    playersMatched: 0,
    playersNewPending: 0,
    playersAmbiguous: 0,
    playersNoTeamMatch: 0,
    logosDownloaded: 0,
    photosDownloaded: 0,
    assetsUploaded: 0,
    playersUpdated: 0,
    errors: [],
  }

  if (!apiConfig.enabled) {
    console.log('Falta API_FOOTBALL_KEY. No puedo traer datos del Mundial 2026 todavía.')
    await writeJson(`${CACHE_DIR}/teams.json`, [])
    await writeJson(`${CACHE_DIR}/fixtures.json`, [])
    await writeJson(`${CACHE_DIR}/standings.json`, [])
    await writeJson(`${CACHE_DIR}/squads.json`, [])
    await writeCsv(TEAM_REVIEW_CSV, ['api_team_id', 'team_slug', 'team_name', 'country', 'code', 'logo_url_external', 'matched_team_id', 'matched_team_name', 'match_confidence', 'status', 'notes'], [])
    await writeCsv(MATCH_REVIEW_CSV, ['api_fixture_id', 'match_number', 'round', 'group_name', 'home_team', 'away_team', 'kickoff_utc', 'stadium', 'status', 'matched_match_id', 'match_confidence', 'notes'], [])
    await writeCsv(PLAYER_REVIEW_CSV, ['api_player_id', 'team_slug', 'team_id', 'name', 'slug', 'shirt_number', 'position', 'club', 'date_of_birth', 'nationality', 'photo_url_external', 'matched_player_id', 'matched_player_name', 'match_confidence', 'status', 'notes'], [])
    await mkdir(path.dirname(REPORT_PATH), { recursive: true })
    await writeFile(REPORT_PATH, buildReport(stats))
    await writeFile(
      SOURCE_STRATEGY_PATH,
      '# Estrategia de fuentes\n\n- Fuente principal: API-Football Mundial 2026.\n- Fuente secundaria: TheSportsDB para imagenes cuando haya key o datos disponibles.\n- PDF Panini eliminado/no usado.\n- Placeholders premium quedan solo como fallback.\n- Supabase es la base final para frontend.\n',
    )
    return
  }

  const [teams, fixtures, standings] = await Promise.all([fetchWorldCupTeams(), fetchWorldCupFixtures(), fetchWorldCupStandings()])
  const squads = await fetchWorldCupSquads(teams)
  stats.teamsObtained = teams.length
  stats.fixturesObtained = fixtures.length
  stats.squadsObtained = squads.length

  await writeJson(`${CACHE_DIR}/teams.json`, teams)
  await writeJson(`${CACHE_DIR}/fixtures.json`, fixtures)
  await writeJson(`${CACHE_DIR}/standings.json`, standings)
  await writeJson(`${CACHE_DIR}/squads.json`, squads)

  const existingTeams = (await getAnonSupabaseRows('teams_info', 'id,name,slug,fifa_code')) as unknown as TeamRow[]
  const existingMatches = (await getAnonSupabaseRows('matches', 'id,match_number,home_team,away_team,kickoff_at,stadium_name')) as unknown as MatchRow[]
  const existingPlayersRaw = (await getAnonSupabaseRows('players_info', 'id,team_id,name,display_name,slug')) as unknown as PlayerRow[]
  const teamsById = new Map(existingTeams.map((team) => [String(team.id), team]))
  const existingPlayers = existingPlayersRaw.map((player) => ({
    ...player,
    team_slug: teamsById.get(String(player.team_id))?.slug ?? null,
  }))

  const teamMatches = new Map<number, TeamMatch>()
  const teamRows: CsvRow[] = []
  for (const apiTeam of teams) {
    const match = matchTeam(apiTeam, existingTeams)
    const apiTeamId = apiTeam.team?.id ?? 0
    if (apiTeamId) teamMatches.set(apiTeamId, match)
    if (match.status === 'matched') stats.teamsMatched += 1
    if (match.status === 'unmatched') stats.teamsUnmatched += 1
    if (match.status === 'ambiguous') stats.teamsAmbiguous += 1

    const teamSlug = match.team?.slug ?? slugify(apiTeam.team?.name)
    const logoUrl = fetchTeamLogo(apiTeam)
    teamRows.push({
      api_team_id: String(apiTeam.team?.id ?? ''),
      team_slug: teamSlug,
      team_name: apiTeam.team?.name ?? '',
      country: apiTeam.team?.country ?? '',
      code: apiTeam.team?.code ?? '',
      logo_url_external: logoUrl ?? '',
      matched_team_id: String(match.team?.id ?? ''),
      matched_team_name: match.team?.name ?? '',
      match_confidence: String(match.confidence),
      status: match.status,
      notes: '',
    })

    if (match.status === 'matched' && logoUrl && match.team?.id) {
      try {
        await uploadTeamLogo(teamSlug, logoUrl, match.team.id, stats)
      } catch (error) {
        stats.errors.push(`Logo ${apiTeam.team?.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  const matchRows: CsvRow[] = []
  for (const fixture of fixtures) {
    const match = matchFixture(fixture, existingMatches)
    matchRows.push({
      api_fixture_id: String(fixture.fixture?.id ?? ''),
      match_number: '',
      round: fixture.league?.round ?? '',
      group_name: fixture.league?.round ?? '',
      home_team: fixture.teams?.home?.name ?? '',
      away_team: fixture.teams?.away?.name ?? '',
      kickoff_utc: fixture.fixture?.date ?? '',
      stadium: fixture.fixture?.venue?.name ?? '',
      status: fixture.fixture?.status?.short ?? '',
      matched_match_id: String(match.match?.id ?? ''),
      match_confidence: String(match.confidence),
      notes: match.confidence >= 90 ? 'match claro' : 'review manual',
    })
  }

  const playerRows: CsvRow[] = []
  for (const squad of squads) {
    const apiTeamId = squad.team?.id ?? 0
    const teamMatch = teamMatches.get(apiTeamId)
    const teamSlug = teamMatch?.team?.slug ?? ''
    const teamId = teamMatch?.team?.id ?? ''
    for (const player of squad.players ?? []) {
      const name = player.name ?? ''
      if (!name) continue
      const playerSlug = slugifyPlayerName(name)
      const photoUrl = player.photo ?? (await fetchPlayerPhotoFallback(name))
      const playerMatch = teamSlug ? matchPlayerByNameAndTeam({ name, slug: playerSlug, team_slug: teamSlug }, existingPlayers) : null
      let status = 'new_pending_review'
      if (!teamSlug) status = 'no_team_match'
      else if (playerMatch?.status === 'auto_matched') status = 'matched'
      else if (playerMatch?.status === 'ambiguous') status = 'ambiguous'

      if (status === 'matched') stats.playersMatched += 1
      if (status === 'new_pending_review') stats.playersNewPending += 1
      if (status === 'ambiguous') stats.playersAmbiguous += 1
      if (status === 'no_team_match') stats.playersNoTeamMatch += 1

      const row: CsvRow = {
        api_player_id: String(player.id ?? ''),
        team_slug: teamSlug,
        team_id: String(teamId),
        name,
        slug: playerSlug,
        shirt_number: String(player.number ?? ''),
        position: player.position ?? '',
        club: '',
        date_of_birth: '',
        nationality: squad.team?.name ?? '',
        photo_url_external: photoUrl ?? '',
        matched_player_id: String(playerMatch?.player?.id ?? ''),
        matched_player_name: playerMatch?.player?.name ?? playerMatch?.player?.display_name ?? '',
        match_confidence: String(playerMatch?.confidence ?? 0),
        status,
        notes: `source=api-football; last_verified_at=${todayIsoDate()}`,
      }
      playerRows.push(row)
      if (status === 'matched' && photoUrl) {
        try {
          await preparePlayerPhoto(row, stats)
        } catch (error) {
          stats.errors.push(`Foto ${name}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }
  }

  await writeCsv(TEAM_REVIEW_CSV, ['api_team_id', 'team_slug', 'team_name', 'country', 'code', 'logo_url_external', 'matched_team_id', 'matched_team_name', 'match_confidence', 'status', 'notes'], teamRows)
  await writeCsv(MATCH_REVIEW_CSV, ['api_fixture_id', 'match_number', 'round', 'group_name', 'home_team', 'away_team', 'kickoff_utc', 'stadium', 'status', 'matched_match_id', 'match_confidence', 'notes'], matchRows)
  await writeCsv(PLAYER_REVIEW_CSV, ['api_player_id', 'team_slug', 'team_id', 'name', 'slug', 'shirt_number', 'position', 'club', 'date_of_birth', 'nationality', 'photo_url_external', 'matched_player_id', 'matched_player_name', 'match_confidence', 'status', 'notes'], playerRows)
  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await writeFile(REPORT_PATH, buildReport(stats))
  await writeFile(
    SOURCE_STRATEGY_PATH,
    '# Estrategia de fuentes\n\n- Fuente principal: API-Football Mundial 2026.\n- Fuente secundaria: TheSportsDB para imagenes.\n- PDF Panini eliminado/no usado.\n- Placeholders premium quedan solo como fallback.\n- Supabase es la base final para frontend.\n',
  )
  console.log(`Sync Mundial 2026 listo. Equipos: ${stats.teamsObtained}, fixtures: ${stats.fixturesObtained}, squads: ${stats.squadsObtained}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
