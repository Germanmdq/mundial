import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  getAdminSupabaseClient,
  getAnonSupabaseRows,
  loadEnvLocal,
  slugify,
  writeCsv,
  type CsvRow,
} from './api-import-utils'

const BASE_URL = 'https://api.wc2026api.com'
const CACHE_DIR = 'supabase/import/api-cache/wc2026api'
const TEAMS_CSV = 'supabase/import/wc2026api_teams_review.csv'
const GROUPS_CSV = 'supabase/import/wc2026api_groups_review.csv'
const MATCHES_CSV = 'supabase/import/wc2026api_matches_review.csv'
const STADIUMS_CSV = 'supabase/import/wc2026api_stadiums_review.csv'
const REPORT_PATH = 'supabase/reports/wc2026api_sync_report.md'
const SOURCE_STRATEGY_PATH = 'supabase/reports/source_strategy.md'

type WcTeam = {
  id: number
  name: string
  code?: string | null
  flag_url?: string | null
  group_name?: string | null
}

type WcGroup = {
  id: number
  name: string
  teams?: WcTeam[]
}

type WcMatch = {
  id: number
  match_number?: number | null
  round?: string | null
  group_name?: string | null
  home_team_id?: number | null
  home_team?: string | null
  home_team_code?: string | null
  home_team_flag?: string | null
  away_team_id?: number | null
  away_team?: string | null
  away_team_code?: string | null
  away_team_flag?: string | null
  stadium_id?: number | null
  stadium?: string | null
  stadium_city?: string | null
  stadium_country?: string | null
  kickoff_utc?: string | null
  home_score?: number | null
  away_score?: number | null
  status?: string | null
}

type WcStadium = {
  id: number
  name: string
  city?: string | null
  country?: string | null
  capacity?: number | null
}

type TeamRow = {
  id: string | number
  name?: string | null
  slug?: string | null
  fifa_code?: string | null
  code?: string | null
}

type MatchRow = {
  id: string | number
  match_number?: number | null
  home_team?: string | null
  away_team?: string | null
  kickoff_at?: string | null
  kickoff_utc?: string | null
  starts_at?: string | null
  group_name?: string | null
  stage?: string | null
  round?: string | null
}

type MatchResult<T> = {
  row: T | null
  confidence: number
  status: 'matched' | 'ambiguous' | 'unmatched'
}

type SyncStats = {
  keyDetected: boolean
  serviceRolePresent: boolean
  wroteSupabase: boolean
  teamsObtained: number
  groupsObtained: number
  matchesObtained: number
  stadiumsObtained: number
  teamsMatched: number
  teamsUnmatched: number
  teamsAmbiguous: number
  matchesMatched: number
  matchesUnmatched: number
  matchesAmbiguous: number
  stadiumsProcessed: number
  teamsUpdated: number
  matchesUpdated: number
  errors: string[]
}

function normalize(value: string | number | null | undefined): string {
  return slugify(String(value ?? '')).replace(/-/g, ' ')
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0))
  for (let index = 0; index <= a.length; index += 1) dp[index][0] = index
  for (let index = 0; index <= b.length; index += 1) dp[0][index] = index
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      dp[row][column] = Math.min(
        dp[row - 1][column] + 1,
        dp[row][column - 1] + 1,
        dp[row - 1][column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      )
    }
  }
  return Math.round((1 - dp[a.length][b.length] / Math.max(a.length, b.length)) * 100)
}

async function fetchWc2026<T>(endpoint: string, key: string): Promise<T[]> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  })
  const text = await response.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`${endpoint} no devolvio JSON valido: ${text.slice(0, 120)}`)
  }
  if (!response.ok) {
    const error = parsed && typeof parsed === 'object' && 'error' in parsed ? String((parsed as { error: unknown }).error) : response.statusText
    throw new Error(`${endpoint} HTTP ${response.status}: ${error}`)
  }
  if (!Array.isArray(parsed)) {
    const error = parsed && typeof parsed === 'object' && 'error' in parsed ? String((parsed as { error: unknown }).error) : 'respuesta no es array'
    throw new Error(`${endpoint}: ${error}`)
  }
  return parsed as T[]
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function matchTeam(team: WcTeam, existingTeams: TeamRow[]): MatchResult<TeamRow> {
  const apiCode = team.code?.toLowerCase() ?? ''
  const apiName = normalize(team.name)
  const apiSlug = slugify(team.name)
  const scored = existingTeams
    .map((existing) => {
      const codeScore =
        apiCode && (existing.fifa_code?.toLowerCase() === apiCode || existing.code?.toLowerCase() === apiCode) ? 100 : 0
      const nameScore = normalize(existing.name) === apiName ? 96 : 0
      const slugScore = existing.slug && slugify(existing.slug) === apiSlug ? 94 : 0
      const fuzzyScore = similarity(apiName, normalize(existing.name))
      return { row: existing, confidence: Math.max(codeScore, nameScore, slugScore, fuzzyScore) }
    })
    .filter((item) => item.confidence >= 80)
    .sort((a, b) => b.confidence - a.confidence)

  if (scored.length === 0) return { row: null, confidence: 0, status: 'unmatched' }
  if (scored.length > 1 && scored[0].confidence === scored[1].confidence) {
    return { row: null, confidence: scored[0].confidence, status: 'ambiguous' }
  }
  return {
    row: scored[0].row,
    confidence: scored[0].confidence,
    status: scored[0].confidence >= 90 ? 'matched' : 'unmatched',
  }
}

function matchOfficialMatch(match: WcMatch, existingMatches: MatchRow[]): MatchResult<MatchRow> {
  const byNumber = existingMatches.filter((row) => row.match_number && match.match_number && Number(row.match_number) === Number(match.match_number))
  if (byNumber.length === 1) return { row: byNumber[0], confidence: 100, status: 'matched' }
  if (byNumber.length > 1) return { row: null, confidence: 100, status: 'ambiguous' }

  const home = normalize(match.home_team)
  const away = normalize(match.away_team)
  const kickoffDate = match.kickoff_utc?.slice(0, 10) ?? ''
  const scored = existingMatches
    .map((row) => {
      const teams = normalize(row.home_team) === home && normalize(row.away_team) === away
      const rowDate = (row.kickoff_at ?? row.kickoff_utc ?? row.starts_at ?? '').slice(0, 10)
      const date = kickoffDate && rowDate === kickoffDate
      const group = normalize(row.group_name ?? row.stage ?? row.round) === normalize(match.group_name ?? match.round)
      return { row, confidence: teams && date ? 98 : teams && group ? 92 : teams ? 86 : 0 }
    })
    .filter((item) => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)

  if (scored.length === 0) return { row: null, confidence: 0, status: 'unmatched' }
  if (scored.length > 1 && scored[0].confidence === scored[1].confidence) {
    return { row: null, confidence: scored[0].confidence, status: 'ambiguous' }
  }
  return {
    row: scored[0].row,
    confidence: scored[0].confidence,
    status: scored[0].confidence >= 90 ? 'matched' : 'unmatched',
  }
}

function addIfColumn(target: Record<string, unknown>, columns: Set<string>, key: string, value: unknown) {
  if (columns.has(key) && value !== undefined) target[key] = value
}

function groupLetter(groupName: string | null | undefined): string | null {
  const value = (groupName ?? '').trim()
  if (!value) return null
  return value.replace(/^group\s+/i, '').slice(0, 1).toUpperCase()
}

async function getColumns(table: string): Promise<Set<string>> {
  const admin = getAdminSupabaseClient()
  if (!admin) return new Set()
  const { data, error } = await admin.from(table).select('*').limit(1)
  if (error || !data?.[0]) return new Set()
  return new Set(Object.keys(data[0]))
}

async function updateTeamIfPossible(team: WcTeam, match: MatchResult<TeamRow>, columns: Set<string>, stats: SyncStats) {
  const admin = getAdminSupabaseClient()
  if (!admin || !match.row || match.confidence < 90) return
  const update: Record<string, unknown> = {}
  addIfColumn(update, columns, 'group_name', team.group_name ?? null)
  addIfColumn(update, columns, 'group_letter', groupLetter(team.group_name))
  addIfColumn(update, columns, 'code', team.code ?? null)
  addIfColumn(update, columns, 'fifa_code', team.code ?? null)
  addIfColumn(update, columns, 'external_id', team.id)
  addIfColumn(update, columns, 'api_id', team.id)
  addIfColumn(update, columns, 'wc2026_api_id', team.id)
  addIfColumn(update, columns, 'updated_at', new Date().toISOString())
  if (Object.keys(update).length === 0) return
  const { error } = await admin.from('teams_info').update(update).eq('id', match.row.id)
  if (error) throw error
  stats.teamsUpdated += 1
  stats.wroteSupabase = true
}

async function updateMatchIfPossible(
  match: WcMatch,
  matchResult: MatchResult<MatchRow>,
  teamMatchesByApiId: Map<number, MatchResult<TeamRow>>,
  columns: Set<string>,
  stats: SyncStats,
) {
  const admin = getAdminSupabaseClient()
  if (!admin || !matchResult.row || matchResult.confidence < 90) return
  const update: Record<string, unknown> = {}
  addIfColumn(update, columns, 'match_number', match.match_number ?? null)
  addIfColumn(update, columns, 'round', match.round ?? null)
  addIfColumn(update, columns, 'stage', match.round ?? null)
  addIfColumn(update, columns, 'group_name', match.group_name ?? null)
  addIfColumn(update, columns, 'group_letter', groupLetter(match.group_name))
  addIfColumn(update, columns, 'home_team', match.home_team ?? null)
  addIfColumn(update, columns, 'away_team', match.away_team ?? null)
  addIfColumn(update, columns, 'home_team_name', match.home_team ?? null)
  addIfColumn(update, columns, 'away_team_name', match.away_team ?? null)
  addIfColumn(update, columns, 'kickoff_utc', match.kickoff_utc ?? null)
  addIfColumn(update, columns, 'kickoff_at', match.kickoff_utc ?? null)
  addIfColumn(update, columns, 'starts_at', match.kickoff_utc ?? null)
  addIfColumn(update, columns, 'stadium', match.stadium ?? null)
  addIfColumn(update, columns, 'stadium_name', match.stadium ?? null)
  addIfColumn(update, columns, 'city', match.stadium_city ?? null)
  addIfColumn(update, columns, 'country', match.stadium_country ?? null)
  addIfColumn(update, columns, 'status', match.status ?? null)
  addIfColumn(update, columns, 'home_score', match.home_score ?? null)
  addIfColumn(update, columns, 'away_score', match.away_score ?? null)
  addIfColumn(update, columns, 'home_goals', match.home_score ?? null)
  addIfColumn(update, columns, 'away_goals', match.away_score ?? null)
  addIfColumn(update, columns, 'updated_at', new Date().toISOString())

  const homeTeam = match.home_team_id ? teamMatchesByApiId.get(match.home_team_id) : null
  const awayTeam = match.away_team_id ? teamMatchesByApiId.get(match.away_team_id) : null
  if (homeTeam?.row?.id) addIfColumn(update, columns, 'home_team_id', homeTeam.row.id)
  if (awayTeam?.row?.id) addIfColumn(update, columns, 'away_team_id', awayTeam.row.id)

  if (Object.keys(update).length === 0) return
  const { error } = await admin.from('matches').update(update).eq('id', matchResult.row.id)
  if (error) throw error
  stats.matchesUpdated += 1
  stats.wroteSupabase = true
}

function buildReport(stats: SyncStats) {
  return `# WC2026 API sync report

- Fecha: ${new Date().toISOString()}
- Fuente principal: WC2026 API
- Key detectada: ${stats.keyDetected ? 'si' : 'no'}
- Service role presente: ${stats.serviceRolePresent ? 'si' : 'no'}
- Escritura en Supabase: ${stats.wroteSupabase ? 'si' : 'no, solo cache/CSV/reporte'}

## Datos obtenidos

- Teams obtenidos: ${stats.teamsObtained}
- Groups obtenidos: ${stats.groupsObtained}
- Matches obtenidos: ${stats.matchesObtained}
- Stadiums obtenidos: ${stats.stadiumsObtained}

## Matching

- Teams matched con Supabase: ${stats.teamsMatched}
- Teams unmatched: ${stats.teamsUnmatched}
- Teams ambiguous: ${stats.teamsAmbiguous}
- Matches matched con Supabase: ${stats.matchesMatched}
- Matches unmatched: ${stats.matchesUnmatched}
- Matches ambiguous: ${stats.matchesAmbiguous}
- Stadiums procesados: ${stats.stadiumsProcessed}

## Escritura

- Teams actualizados: ${stats.teamsUpdated}
- Matches actualizados: ${stats.matchesUpdated}
- Falta SUPABASE_SERVICE_ROLE_KEY: ${stats.serviceRolePresent ? 'no' : 'si'}

## Archivos generados

- \`${CACHE_DIR}/teams.json\`
- \`${CACHE_DIR}/groups.json\`
- \`${CACHE_DIR}/matches.json\`
- \`${CACHE_DIR}/stadiums.json\`
- \`${TEAMS_CSV}\`
- \`${GROUPS_CSV}\`
- \`${MATCHES_CSV}\`
- \`${STADIUMS_CSV}\`

## Limitaciones

- WC2026 API no provee endpoint de jugadores.
- Jugadores quedan en \`players_info\` con el estado actual, incluyendo \`pending_review\`.
- No trae fotos de jugadores.
- No trae escudos/logos.
- \`flag_url\` existe, pero actualmente viene vacio para los 48 equipos.
- Se mantienen placeholders premium y Storage como fallback visual.

## Errores

${stats.errors.length > 0 ? stats.errors.map((error) => `- ${error}`).join('\n') : '- Sin errores.'}
`
}

async function main() {
  await loadEnvLocal()
  const key = process.env.WC2026_API_KEY?.trim()
  const admin = getAdminSupabaseClient()
  const stats: SyncStats = {
    keyDetected: Boolean(key),
    serviceRolePresent: Boolean(admin),
    wroteSupabase: false,
    teamsObtained: 0,
    groupsObtained: 0,
    matchesObtained: 0,
    stadiumsObtained: 0,
    teamsMatched: 0,
    teamsUnmatched: 0,
    teamsAmbiguous: 0,
    matchesMatched: 0,
    matchesUnmatched: 0,
    matchesAmbiguous: 0,
    stadiumsProcessed: 0,
    teamsUpdated: 0,
    matchesUpdated: 0,
    errors: [],
  }

  if (!key || key === 'PEGAR_KEY_WC2026_ACA') {
    await mkdir(path.dirname(REPORT_PATH), { recursive: true })
    stats.errors.push('Falta WC2026_API_KEY real.')
    await writeFile(REPORT_PATH, buildReport(stats))
    console.log('Falta WC2026_API_KEY real. No puedo sincronizar WC2026 API todavia.')
    return
  }

  const [teams, groups, matches, stadiums] = await Promise.all([
    fetchWc2026<WcTeam>('/teams', key),
    fetchWc2026<WcGroup>('/groups', key),
    fetchWc2026<WcMatch>('/matches', key),
    fetchWc2026<WcStadium>('/stadiums', key),
  ])

  stats.teamsObtained = teams.length
  stats.groupsObtained = groups.length
  stats.matchesObtained = matches.length
  stats.stadiumsObtained = stadiums.length
  stats.stadiumsProcessed = stadiums.length

  await writeJson(`${CACHE_DIR}/teams.json`, teams)
  await writeJson(`${CACHE_DIR}/groups.json`, groups)
  await writeJson(`${CACHE_DIR}/matches.json`, matches)
  await writeJson(`${CACHE_DIR}/stadiums.json`, stadiums)

  const existingTeams = (await getAnonSupabaseRows('teams_info', 'id,name,slug,fifa_code')) as unknown as TeamRow[]
  const existingMatches = (await getAnonSupabaseRows('matches', 'id,match_number,home_team,away_team,kickoff_at,group_name,stage')) as unknown as MatchRow[]
  const teamColumns = await getColumns('teams_info')
  const matchColumns = await getColumns('matches')

  const teamMatchesByApiId = new Map<number, MatchResult<TeamRow>>()
  const teamRows: CsvRow[] = []
  for (const team of teams) {
    const result = matchTeam(team, existingTeams)
    teamMatchesByApiId.set(team.id, result)
    if (result.status === 'matched') stats.teamsMatched += 1
    if (result.status === 'unmatched') stats.teamsUnmatched += 1
    if (result.status === 'ambiguous') stats.teamsAmbiguous += 1
    teamRows.push({
      api_team_id: String(team.id),
      api_name: team.name,
      api_code: team.code ?? '',
      api_group_name: team.group_name ?? '',
      api_flag_url: team.flag_url ?? '',
      matched_team_id: String(result.row?.id ?? ''),
      matched_team_name: result.row?.name ?? '',
      matched_team_slug: result.row?.slug ?? '',
      match_confidence: String(result.confidence),
      status: result.status,
      notes: team.flag_url ? 'flag_url poblada' : 'flag_url vacia',
    })
    try {
      await updateTeamIfPossible(team, result, teamColumns, stats)
    } catch (error) {
      stats.errors.push(`teams_info ${team.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const groupRows: CsvRow[] = groups.map((group) => ({
    api_group_id: String(group.id),
    group_name: group.name,
    teams_count: String(group.teams?.length ?? 0),
    team_names: (group.teams ?? []).map((team) => team.name).join(' | '),
    raw_json: JSON.stringify(group),
  }))

  const matchRows: CsvRow[] = []
  for (const match of matches) {
    const result = matchOfficialMatch(match, existingMatches)
    if (result.status === 'matched') stats.matchesMatched += 1
    if (result.status === 'unmatched') stats.matchesUnmatched += 1
    if (result.status === 'ambiguous') stats.matchesAmbiguous += 1
    matchRows.push({
      api_match_id: String(match.id),
      match_number: String(match.match_number ?? ''),
      round: match.round ?? '',
      group_name: match.group_name ?? '',
      home_team_name: match.home_team ?? '',
      away_team_name: match.away_team ?? '',
      home_team_code: match.home_team_code ?? '',
      away_team_code: match.away_team_code ?? '',
      kickoff_utc: match.kickoff_utc ?? '',
      stadium_name: match.stadium ?? '',
      city: match.stadium_city ?? '',
      country: match.stadium_country ?? '',
      status: match.status ?? '',
      home_score: String(match.home_score ?? ''),
      away_score: String(match.away_score ?? ''),
      matched_match_id: String(result.row?.id ?? ''),
      match_confidence: String(result.confidence),
      notes: result.status === 'matched' ? 'match claro' : 'review manual',
    })
    try {
      await updateMatchIfPossible(match, result, teamMatchesByApiId, matchColumns, stats)
    } catch (error) {
      stats.errors.push(`matches ${match.match_number ?? match.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const stadiumRows: CsvRow[] = stadiums.map((stadium) => ({
    api_stadium_id: String(stadium.id),
    name: stadium.name,
    city: stadium.city ?? '',
    country: stadium.country ?? '',
    capacity: String(stadium.capacity ?? ''),
    raw_json: JSON.stringify(stadium),
  }))

  await writeCsv(TEAMS_CSV, ['api_team_id', 'api_name', 'api_code', 'api_group_name', 'api_flag_url', 'matched_team_id', 'matched_team_name', 'matched_team_slug', 'match_confidence', 'status', 'notes'], teamRows)
  await writeCsv(GROUPS_CSV, ['api_group_id', 'group_name', 'teams_count', 'team_names', 'raw_json'], groupRows)
  await writeCsv(
    MATCHES_CSV,
    [
      'api_match_id',
      'match_number',
      'round',
      'group_name',
      'home_team_name',
      'away_team_name',
      'home_team_code',
      'away_team_code',
      'kickoff_utc',
      'stadium_name',
      'city',
      'country',
      'status',
      'home_score',
      'away_score',
      'matched_match_id',
      'match_confidence',
      'notes',
    ],
    matchRows,
  )
  await writeCsv(STADIUMS_CSV, ['api_stadium_id', 'name', 'city', 'country', 'capacity', 'raw_json'], stadiumRows)

  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await writeFile(REPORT_PATH, buildReport(stats))
  await writeFile(
    SOURCE_STRATEGY_PATH,
    '# Estrategia de fuentes\n\n## Fuente principal actual\n\n- WC2026 API para equipos, grupos, partidos y estadios.\n\n## Fuente secundaria\n\n- Supabase local es la base final para frontend.\n- Placeholders premium cubren assets faltantes.\n- TheSportsDB u otra fuente futura queda reservada para jugadores, fotos y assets reales.\n\n## API-Football\n\n- API-Football queda descartada en plan Free para `season=2026` porque no permite consultar esa temporada.\n\n## Panini/PDF\n\n- Panini/PDF eliminado/no usado.\n',
  )

  console.log(
    `WC2026 sync listo. Teams: ${stats.teamsObtained}, groups: ${stats.groupsObtained}, matches: ${stats.matchesObtained}, stadiums: ${stats.stadiumsObtained}. Matched teams: ${stats.teamsMatched}, matched matches: ${stats.matchesMatched}. Supabase: ${stats.wroteSupabase ? 'escrito' : 'solo cache/CSV'}.`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
