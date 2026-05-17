import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { getAdminSupabaseClient, loadEnvLocal, writeCsv, type CsvRow } from './api-import-utils'

const BACKUP_PATH = 'supabase/backups/players_info_before_wikipedia_sections_cleanup.csv'
const REVIEW_CSV = 'supabase/import/wikipedia_section_players_cleanup_review.csv'
const REPORT_PATH = 'supabase/reports/wikipedia_section_players_cleanup_report.md'

type PlayerRow = Record<string, unknown> & {
  id: string | number
  team_id?: string | number | null
  team_slug?: string | null
  name?: string | null
  slug?: string | null
  position?: string | null
  club?: string | null
  nationality?: string | null
  source_url?: string | null
  status?: string | null
}

type TeamRow = {
  id: string | number
  name?: string | null
  slug?: string | null
}

const SECTION_NAMES = [
  'Bids',
  'Broadcasters',
  'Broadcasting',
  'Final draw',
  'Finals',
  'General information',
  'Miscellaneous',
  'Official symbols',
  'Officials',
  'Qualification',
  'Squads',
  'Stages',
  'Team appearances',
  'Tournaments',
  'Awards',
  'Marketing',
  'Sponsorship',
  'Venues',
  'Host selection',
  'Draw',
  'Format',
  'Schedule',
  'Prize money',
  'Statistics',
  'Discipline',
  'Controversies',
]

const SECTION_NAME_PATTERN = new RegExp(`\\b(${SECTION_NAMES.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')
const ARTICLE_CLUB_PATTERN =
  /(19[3-9]\d|20[0-3]\d).*(19[3-9]\d|20[0-3]\d)|\b(AFC|CAF|CONCACAF|CONMEBOL|OFC|UEFA)\b|Group stage|Group [A-L]|Qualification|World Cup|Broadcasting|Awards|Controversies|Stadiums|Task force|Mascots|Official Album/i
const WIKI_SOURCE_PATTERN = /wikipedia\.org\/wiki\/2026_FIFA_World_Cup_squads/i

function clean(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function normalize(value: unknown): string {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function hasHumanNameShape(name: string): boolean {
  const words = name
    .replace(/[.'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length < 2 || words.length > 5) return false
  return words.every((word) => /^[A-Za-zÀ-ÿ]{2,}$/.test(word))
}

function isPlaceholderPosition(value: unknown): boolean {
  const text = normalize(value)
  return text === '' || text === 'por confirmar' || text === 'posicion por confirmar' || text === 'posición por confirmar'
}

function sectionReasons(player: PlayerRow): string[] {
  const reasons: string[] = []
  const name = clean(player.name)
  const club = clean(player.club)
  const sourceUrl = clean(player.source_url)

  if (SECTION_NAMES.some((section) => normalize(section) === normalize(name))) reasons.push('blocklist_exact_name')
  if (SECTION_NAME_PATTERN.test(name)) reasons.push('section_name_pattern')
  if (!hasHumanNameShape(name) && SECTION_NAME_PATTERN.test(`${name} ${club}`)) reasons.push('generic_non_human_name')
  if (isPlaceholderPosition(player.position) && ARTICLE_CLUB_PATTERN.test(club)) reasons.push('placeholder_position_with_article_club')
  if (ARTICLE_CLUB_PATTERN.test(`${name} ${club}`) && WIKI_SOURCE_PATTERN.test(sourceUrl)) reasons.push('wikipedia_article_metadata')
  if (WIKI_SOURCE_PATTERN.test(sourceUrl) && !hasHumanNameShape(name) && SECTION_NAME_PATTERN.test(`${name} ${club}`)) reasons.push('wikipedia_source_non_player')

  return Array.from(new Set(reasons))
}

function actionFor(reasons: string[]): 'delete' | 'keep' | 'manual_review' {
  if (reasons.includes('blocklist_exact_name')) return 'delete'
  if (reasons.includes('placeholder_position_with_article_club')) return 'delete'
  if (reasons.includes('wikipedia_article_metadata')) return 'delete'
  if (reasons.length > 0) return 'manual_review'
  return 'keep'
}

async function fetchAll<T>(table: string, select: string): Promise<T[]> {
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.')
  const rows: T[] = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin.from(table).select(select).range(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...((data ?? []) as T[]))
    if (!data || data.length < pageSize) break
  }
  return rows
}

function toCsvRows(rows: PlayerRow[], headers: string[]): CsvRow[] {
  return rows.map((row) => Object.fromEntries(headers.map((header) => [header, clean(row[header])])))
}

async function deleteRows(ids: Array<string | number>, useSoftDelete: boolean) {
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.')
  let deleted = 0
  const errors: string[] = []
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100)
    const query = useSoftDelete
      ? admin.from('players_info').update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).in('id', batch)
      : admin.from('players_info').delete().in('id', batch)
    const { error } = await query
    if (error) errors.push(error.message)
    else deleted += batch.length
  }
  return { deleted, errors }
}

async function main() {
  await loadEnvLocal()
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY. No puedo limpiar players_info.')

  await mkdir(path.dirname(BACKUP_PATH), { recursive: true })
  await mkdir(path.dirname(REVIEW_CSV), { recursive: true })
  await mkdir(path.dirname(REPORT_PATH), { recursive: true })

  const players = await fetchAll<PlayerRow>('players_info', '*')
  if (players.length === 0) throw new Error('players_info no devolvio filas; no se continua.')
  const columns = Array.from(new Set(players.flatMap((row) => Object.keys(row)))).sort()
  const hasDeletedAt = columns.includes('deleted_at')
  await writeCsv(BACKUP_PATH, columns, toCsvRows(players, columns))

  const { data: teamsData, error: teamsError } = await admin.from('teams_info').select('id,name,slug').order('name')
  if (teamsError) throw teamsError
  const teams = (teamsData ?? []) as TeamRow[]
  const teamById = new Map(teams.map((team) => [String(team.id), team]))

  const reviewRows = players.map((player) => {
    const reasons = sectionReasons(player)
    const action = actionFor(reasons)
    return {
      id: clean(player.id),
      team_id: clean(player.team_id),
      team_slug: clean(player.team_slug) || clean(teamById.get(String(player.team_id))?.slug),
      name: clean(player.name),
      slug: clean(player.slug),
      position: clean(player.position),
      club: clean(player.club),
      nationality: clean(player.nationality),
      source_url: clean(player.source_url),
      status: clean(player.status),
      reason: reasons.join('|'),
      action,
    }
  })

  const candidates = reviewRows.filter((row) => row.action !== 'keep')
  const deleteIds = reviewRows.filter((row) => row.action === 'delete').map((row) => row.id)
  await writeCsv(
    REVIEW_CSV,
    ['id', 'team_id', 'team_slug', 'name', 'slug', 'position', 'club', 'nationality', 'source_url', 'status', 'reason', 'action'],
    reviewRows,
  )
  const deleteResult = await deleteRows(deleteIds, hasDeletedAt)

  const remainingSelect = ['id', 'team_id', 'team_slug', 'name', 'slug', 'position', 'club', 'nationality', 'source_url', 'status']
    .filter((column) => columns.includes(column))
    .join(',')
  const remaining = await fetchAll<PlayerRow>('players_info', remainingSelect)
  const remainingSectionRows = remaining.filter((player) => sectionReasons(player).length > 0)
  const counts = new Map<string, number>()
  for (const player of remaining) {
    const team = teamById.get(String(player.team_id))
    const teamSlug = clean(player.team_slug) || clean(team?.slug) || 'sin-equipo'
    counts.set(teamSlug, (counts.get(teamSlug) ?? 0) + 1)
  }
  const getCount = (slug: string) => counts.get(slug) ?? 0
  const examplesDeleted = reviewRows.filter((row) => row.action === 'delete').slice(0, 40)
  const examplesKept = remaining
    .filter((player) => WIKI_SOURCE_PATTERN.test(clean(player.source_url)) && hasHumanNameShape(clean(player.name)))
    .slice(0, 20)
    .map((player) => `${clean(player.name)} (${clean(teamById.get(String(player.team_id))?.slug)})`)

  await writeCsv(
    REPORT_PATH,
    ['metric', 'value'],
    [
      { metric: 'total_players_before', value: String(players.length) },
      { metric: 'candidates', value: String(candidates.length) },
      { metric: 'deleted', value: String(deleteResult.deleted) },
      { metric: 'remaining', value: String(remaining.length) },
      { metric: 'remaining_section_candidates', value: String(remainingSectionRows.length) },
      { metric: 'mexico', value: String(getCount('mexico')) },
      { metric: 'brazil', value: String(getCount('brazil')) },
      { metric: 'south-korea', value: String(getCount('south-korea')) },
      { metric: 'south-africa', value: String(getCount('south-africa')) },
      { metric: 'czechia', value: String(getCount('czechia')) },
    ],
  )

  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile(
      REPORT_PATH,
      `# Wikipedia section players cleanup report

## Problema

El scraper de Wikipedia habia interpretado tablas de navegacion/secciones del articulo como si fueran jugadores. Ejemplos: Bids, Broadcasters, Final draw, General information, Official symbols, Team appearances y Tournaments.

## Resultado

- Total players_info antes: ${players.length}
- Candidatos detectados: ${candidates.length}
- Registros ${hasDeletedAt ? 'marcados deleted_at' : 'borrados'}: ${deleteResult.deleted}
- Registros restantes: ${remaining.length}
- Candidatos restantes a revision manual: ${remainingSectionRows.length}

## Conteos finales

- Mexico: ${getCount('mexico')}
- Brazil: ${getCount('brazil')}
- South Korea: ${getCount('south-korea')}
- South Africa: ${getCount('south-africa')}
- Czechia: ${getCount('czechia')}

## Ejemplos borrados

${examplesDeleted.length ? examplesDeleted.map((row) => `- ${row.name} (${row.team_slug}): ${row.reason}`).join('\n') : '- Ninguno'}

## Jugadores reales conservados

${examplesKept.length ? examplesKept.map((row) => `- ${row}`).join('\n') : '- No se listaron ejemplos'}

## Verificacion de blocklist

${remainingSectionRows.length ? remainingSectionRows.map((player) => `- ${clean(player.name)} (${clean(teamById.get(String(player.team_id))?.slug)})`).join('\n') : '- No quedan candidatos de seccion detectados.'}

## Cambios al scraper

- Solo importa tablas con encabezados claros de plantel.
- Ignora tablas de navegacion, historial, broadcasters, formato, sedes y metadatos.
- Ignora nombres de seccion o nombres que no tienen forma humana.

## Cambios al frontend

- \`isLikelyWikipediaSectionPlayer\` bloquea secciones conocidas y contenido de articulo.
- \`isDisplayablePlayer\` excluye filas OCR o secciones de Wikipedia antes de renderizar.

## Errores

${deleteResult.errors.length ? deleteResult.errors.map((error) => `- ${error}`).join('\n') : '- Sin errores'}
`,
    ),
  )

  console.log(`Wikipedia section cleanup listo. Antes: ${players.length}. Borrados: ${deleteResult.deleted}. Restantes: ${remaining.length}. Mexico: ${getCount('mexico')}. Brazil: ${getCount('brazil')}. South Korea: ${getCount('south-korea')}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
