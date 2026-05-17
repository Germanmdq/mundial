import { getApiFootballConfig, getTheSportsDbConfig } from '../src/lib/worldcup/external-api-config'
import { CsvRow, loadEnvLocal, readCsv, writeCsv } from './api-import-utils'

const INPUT = 'supabase/import/team_search_input.csv'
const OUTPUT = 'supabase/import/team_search_results.csv'
const HEADERS = ['team_slug', 'team_name', 'provider', 'provider_team_id', 'provider_team_name', 'country', 'logo_url', 'confidence', 'notes']

type ApiFootballTeamResult = {
  team?: {
    id?: string | number
    name?: string
    country?: string
    logo?: string
  }
  country?: {
    name?: string
  }
}

type TheSportsDbTeam = {
  idTeam?: string
  strTeam?: string
  strCountry?: string
  strBadge?: string
  strLogo?: string
}

function similarity(a: string, b: string) {
  const left = a.toLowerCase()
  const right = b.toLowerCase()
  if (left === right) return 100
  if (right.includes(left) || left.includes(right)) return 88
  return Math.max(35, 100 - Math.abs(left.length - right.length) * 5)
}

async function searchApiFootball(row: CsvRow): Promise<CsvRow[]> {
  const config = getApiFootballConfig()
  if (!config.enabled) return []
  const url = `${config.baseUrl}/teams?search=${encodeURIComponent(row.team_name)}`
  const response = await fetch(url, { headers: config.headers })
  if (!response.ok) return []
  const json = await response.json()
  return ((json.response ?? []) as ApiFootballTeamResult[]).slice(0, 8).map((item) => ({
    team_slug: row.team_slug,
    team_name: row.team_name,
    provider: 'api-football',
    provider_team_id: String(item.team?.id ?? ''),
    provider_team_name: item.team?.name ?? '',
    country: item.team?.country ?? item.country?.name ?? '',
    logo_url: item.team?.logo ?? '',
    confidence: String(similarity(row.team_name, item.team?.name ?? '')),
    notes: '',
  }))
}

async function searchTheSportsDb(row: CsvRow): Promise<CsvRow[]> {
  const config = getTheSportsDbConfig()
  if (!config.enabled) return []
  const url = `${config.baseUrl}/searchteams.php?t=${encodeURIComponent(row.team_name)}`
  const response = await fetch(url)
  if (!response.ok) return []
  const json = await response.json()
  return ((json.teams ?? []) as TheSportsDbTeam[]).slice(0, 8).map((team) => ({
    team_slug: row.team_slug,
    team_name: row.team_name,
    provider: 'thesportsdb',
    provider_team_id: String(team.idTeam ?? ''),
    provider_team_name: team.strTeam ?? '',
    country: team.strCountry ?? '',
    logo_url: team.strBadge ?? team.strLogo ?? '',
    confidence: String(similarity(row.team_name, team.strTeam ?? '')),
    notes: config.note ?? '',
  }))
}

async function main() {
  await loadEnvLocal()
  const rows = await readCsv(INPUT)
  if (rows.length === 0) {
    await writeCsv(OUTPUT, HEADERS, [])
    console.log(`No hay equipos para buscar. Completar ${INPUT}.`)
    return
  }

  const results: CsvRow[] = []
  for (const row of rows) {
    if (!row.team_name) continue
    results.push(...(await searchApiFootball(row)))
    results.push(...(await searchTheSportsDb(row)))
    if (results.filter((item) => item.team_slug === row.team_slug).length === 0) {
      results.push({
        team_slug: row.team_slug,
        team_name: row.team_name,
        provider: '',
        provider_team_id: '',
        provider_team_name: '',
        country: row.country,
        logo_url: '',
        confidence: '0',
        notes: 'Sin candidatos o faltan API keys.',
      })
    }
  }

  await writeCsv(OUTPUT, HEADERS, results)
  console.log(`Resultados guardados en ${OUTPUT}: ${results.length}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
