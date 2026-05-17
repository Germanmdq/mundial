import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { getAnonSupabaseRows, getAdminSupabaseClient, loadEnvLocal, writeCsv, type CsvRow } from './api-import-utils'
import { matchPlayerByNameAndTeam, slugifyPlayerName } from '../src/lib/worldcup/player-matching'

const SOURCE_URL = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads'
const OUTPUT_CSV = 'supabase/import/wikipedia_worldcup_players_review.csv'
const REPORT_PATH = 'supabase/reports/missing_assets_sources_report.md'

type TeamRow = { id: string | number; name?: string | null; slug?: string | null; fifa_code?: string | null }
type PlayerRow = { id: string | number; team_id?: string | number | null; name?: string | null; display_name?: string | null; slug?: string | null; team_slug?: string | null }

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<sup[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractRows(html: string, teams: TeamRow[], players: PlayerRow[]): CsvRow[] {
  const rows: CsvRow[] = []
  const sections = html.split(/<h2|<h3/gi)
  for (const section of sections) {
    const heading = stripHtml(section.slice(0, 500))
    const team = teams.find((candidate) => heading.toLowerCase().includes(String(candidate.name ?? '').toLowerCase()))
    if (!team?.slug) continue
    const tableMatches = section.match(/<table[\s\S]*?<\/table>/gi) ?? []
    for (const table of tableMatches) {
      const htmlRows = table.match(/<tr[\s\S]*?<\/tr>/gi) ?? []
      for (const htmlRow of htmlRows) {
        const cells = [...htmlRow.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) => stripHtml(match[1]))
        if (cells.length < 2) continue
        const joined = cells.join(' | ')
        if (/player|pos|club|date/i.test(joined) && !/\d/.test(joined)) continue
        const name = cells.find((cell) => /[A-Za-zÀ-ÿ]{3,}/.test(cell) && !/GK|DF|MF|FW|Pos|Club|Date/i.test(cell)) ?? ''
        if (!name || name.length < 3) continue
        const positionMatch = joined.match(/\b(GK|DF|MF|FW|Goalkeeper|Defender|Midfielder|Forward)\b/i)
        const position = positionMatch?.[1] ?? ''
        const club = cells[cells.length - 1] && cells[cells.length - 1] !== name ? cells[cells.length - 1] : ''
        const birth = cells.find((cell) => /\d{4}/.test(cell) && /born|age|\d{1,2}/i.test(cell)) ?? ''
        const matchResult = matchPlayerByNameAndTeam({ name, slug: slugifyPlayerName(name), team_slug: team.slug }, players)
        rows.push({
          source: 'Wikipedia',
          team_slug: team.slug,
          team_name: team.name ?? '',
          name,
          slug: slugifyPlayerName(name),
          position,
          club,
          date_of_birth: birth,
          nationality: team.name ?? '',
          source_url: SOURCE_URL,
          matched_player_id: String(matchResult.player?.id ?? ''),
          matched_player_name: matchResult.player?.name ?? matchResult.player?.display_name ?? '',
          match_confidence: String(matchResult.confidence),
          status: matchResult.status === 'auto_matched' ? 'matched_pending_review' : 'pending_review',
          notes: `raw=${joined}`,
        })
      }
    }
  }
  return rows.filter((row, index, all) => all.findIndex((item) => item.team_slug === row.team_slug && item.slug === row.slug) === index)
}

async function appendReport(section: string) {
  let existing = ''
  try {
    existing = await readFile(REPORT_PATH, 'utf8')
  } catch {
    existing = '# Missing assets sources report\n\n'
  }
  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await writeFile(REPORT_PATH, `${existing.trim()}\n\n${section}\n`)
}

async function main() {
  await loadEnvLocal()
  const teams = (await getAnonSupabaseRows('teams_info', 'id,name,slug,fifa_code')) as unknown as TeamRow[]
  const playersRaw = (await getAnonSupabaseRows('players_info', 'id,team_id,name,display_name,slug')) as unknown as PlayerRow[]
  const teamById = new Map(teams.map((team) => [String(team.id), team]))
  const players = playersRaw.map((player) => ({ ...player, team_slug: teamById.get(String(player.team_id))?.slug ?? null }))
  const response = await fetch(SOURCE_URL, { headers: { 'user-agent': 'mi-prediccion-data-review/1.0' } })
  let rows: CsvRow[] = []
  let notes = ''
  if (response.ok) {
    rows = extractRows(await response.text(), teams, players)
    if (rows.length === 0) notes = 'No se detectaron tablas de planteles publicables en la pagina.'
  } else {
    notes = `Wikipedia HTTP ${response.status}`
  }

  await writeCsv(OUTPUT_CSV, ['source', 'team_slug', 'team_name', 'name', 'slug', 'position', 'club', 'date_of_birth', 'nationality', 'source_url', 'matched_player_id', 'matched_player_name', 'match_confidence', 'status', 'notes'], rows)

  const admin = getAdminSupabaseClient()
  let updates = 0
  let skippedNew = 0
  const errors: string[] = []
  if (admin && rows.length > 0) {
    for (const row of rows) {
      if (!row.matched_player_id) {
        skippedNew += 1
        continue
      }
      const payload = {
        display_name: row.name,
        position: row.position || null,
        club: row.club || null,
        birth_date: row.date_of_birth || null,
        nationality: row.nationality || null,
        source_url: row.source_url,
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      }
      const result = await admin.from('players_info').update(payload).eq('id', row.matched_player_id)
      if (result.error) {
        errors.push(`${row.name}: ${result.error.message}`)
      } else {
        updates += 1
      }
    }
  }

  await appendReport(`## Wikipedia World Cup squads\n\n- Fuente: ${SOURCE_URL}\n- Jugadores encontrados: ${rows.length}\n- Updates Supabase pending_review: ${updates}\n- Nuevos no insertados para evitar duplicados: ${skippedNew}\n- Service role presente: ${admin ? 'si' : 'no'}\n- CSV: \`${OUTPUT_CSV}\`\n- Notas: ${notes || 'sin notas'}\n- Errores: ${errors.length ? errors.slice(0, 20).join(' | ') : 'sin errores'}`)
  console.log(`Wikipedia squads listo. Jugadores encontrados: ${rows.length}. Updates: ${updates}. Nuevos sin insertar: ${skippedNew}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
