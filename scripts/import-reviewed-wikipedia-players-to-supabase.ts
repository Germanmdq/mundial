import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getAdminSupabaseClient, loadEnvLocal, readCsv, slugify } from './api-import-utils'

const CSV_PATH = 'supabase/import/wikipedia_worldcup_players_review.csv'
const SCHEMA_REPORT = 'supabase/reports/players_import_schema_report.md'
const CSV_AUDIT_REPORT = 'supabase/reports/wikipedia_players_csv_audit.md'
const IMPORT_REPORT = 'supabase/reports/wikipedia_players_import_report.md'
const SOURCE_URL = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads'

type DbTeam = {
  id: string | number
  name?: string | null
  slug?: string | null
  fifa_code?: string | null
}

type DbPlayer = {
  id: string | number
  team_id?: string | number | null
  team_slug?: string | null
  name?: string | null
  display_name?: string | null
  slug?: string | null
  position?: string | null
  club?: string | null
  date_of_birth?: string | null
  birth_date?: string | null
  nationality?: string | null
  shirt_number?: string | number | null
  photo_url?: string | null
  photo_path?: string | null
  photo_storage_path?: string | null
  source_url?: string | null
  last_verified_at?: string | null
  status?: string | null
}

type ImportStats = {
  csvRows: number
  inserted: number
  updated: number
  skipped: number
  duplicates: number
  unmatchedTeams: Set<string>
  errors: string[]
}

const TEAM_ALIASES: Record<string, string> = {
  brazil: 'brazil',
  brasil: 'brazil',
  mexico: 'mexico',
  'méxico': 'mexico',
  'south-africa': 'south-africa',
  sudafrica: 'south-africa',
  'sudáfrica': 'south-africa',
  'south-korea': 'south-korea',
  'korea-republic': 'south-korea',
  'corea-del-sur': 'south-korea',
  czechia: 'czechia',
  chequia: 'czechia',
  'united-states': 'united-states',
  usa: 'united-states',
  germany: 'germany',
  alemania: 'germany',
  england: 'england',
  inglaterra: 'england',
  scotland: 'scotland',
  escocia: 'scotland',
  turkey: 'turkey',
  turquia: 'turkey',
  'turquía': 'turkey',
  'bosnia-herzegovina': 'bosnia-and-herzegovina',
  'bosnia-and-herzegovina': 'bosnia-and-herzegovina',
}

function normalizeKey(value: string | null | undefined): string {
  const slug = slugify(value)
  return TEAM_ALIASES[slug] ?? slug
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(value: string | null | undefined): string | null {
  const match = (value ?? '').match(/\d{4}-\d{2}-\d{2}/)
  return match?.[0] ?? null
}

function clean(value: string | null | undefined): string | null {
  const text = (value ?? '').trim()
  return text.length > 0 ? text : null
}

function shouldFill(current: unknown): boolean {
  return current === null || current === undefined || (typeof current === 'string' && current.trim() === '')
}

function pickColumns(columns: Set<string>, payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([key, value]) => columns.has(key) && value !== undefined))
}

function matchTeam(row: Record<string, string>, teams: DbTeam[]): DbTeam | null {
  const candidates = [row.team_slug, row.team_name, row.nationality].map(normalizeKey).filter(Boolean)
  for (const candidate of candidates) {
    const found = teams.find((team) => normalizeKey(team.slug) === candidate || normalizeKey(team.name) === candidate)
    if (found) return found
  }
  const code = row.team_code?.toLowerCase()
  if (code) return teams.find((team) => team.fifa_code?.toLowerCase() === code) ?? null
  return null
}

function playerKey(teamId: string | number | null | undefined, slug: string | null | undefined) {
  return `${teamId ?? ''}:${slug ?? ''}`
}

async function fetchAllRows<T>(table: string, select: string): Promise<T[]> {
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.')
  const pageSize = 1000
  const rows: T[] = []
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1
    const { data, error } = await admin.from(table).select(select).range(from, to)
    if (error) throw error
    rows.push(...((data ?? []) as T[]))
    if (!data || data.length < pageSize) break
  }
  return rows
}

async function writeReports(
  columns: string[],
  csvRows: Record<string, string>[],
  teams: DbTeam[],
  stats?: ImportStats,
  playersByTeam?: Record<string, number>,
) {
  await mkdir(path.dirname(SCHEMA_REPORT), { recursive: true })
  await writeFile(
    SCHEMA_REPORT,
    `# Players import schema report

- Tabla: \`players_info\`
- Columnas reales detectadas: ${columns.length}

## Columnas

${columns.map((column) => `- ${column}`).join('\n')}
`,
  )

  const rowsWithTeamSlug = csvRows.filter((row) => clean(row.team_slug)).length
  const rowsWithName = csvRows.filter((row) => clean(row.name)).length
  const rowsWithPosition = csvRows.filter((row) => clean(row.position)).length
  const rowsWithClub = csvRows.filter((row) => clean(row.club)).length
  const teamsDetected = Array.from(new Set(csvRows.map((row) => row.team_slug).filter(Boolean))).sort()
  const unmatchedTeams = Array.from(
    new Set(
      csvRows
        .filter((row) => !matchTeam(row, teams))
        .map((row) => row.team_slug || row.team_name || row.nationality || 'sin_equipo')
        .filter(Boolean),
    ),
  ).sort()
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const row of csvRows) {
    const key = `${normalizeKey(row.team_slug)}:${row.slug || slugify(row.name)}`
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  }

  await writeFile(
    CSV_AUDIT_REPORT,
    `# Wikipedia players CSV audit

- CSV: \`${CSV_PATH}\`
- Filas totales: ${csvRows.length}
- Filas con team_slug: ${rowsWithTeamSlug}
- Filas con name: ${rowsWithName}
- Filas con position: ${rowsWithPosition}
- Filas con club: ${rowsWithClub}
- Equipos detectados: ${teamsDetected.length}
- Equipos sin match en teams_info: ${unmatchedTeams.length}
- Duplicados por team_slug + slug: ${duplicates.size}

## Equipos sin match

${unmatchedTeams.length ? unmatchedTeams.map((team) => `- ${team}`).join('\n') : '- Ninguno'}

## Duplicados

${duplicates.size ? Array.from(duplicates).map((item) => `- ${item}`).join('\n') : '- Ninguno'}
`,
  )

  if (stats) {
    await writeFile(
      IMPORT_REPORT,
      `# Wikipedia players import report

- CSV filas: ${stats.csvRows}
- Insertados: ${stats.inserted}
- Actualizados: ${stats.updated}
- Omitidos: ${stats.skipped}
- Duplicados detectados/omitidos: ${stats.duplicates}
- Equipos sin match: ${stats.unmatchedTeams.size}

## Equipos sin match

${stats.unmatchedTeams.size ? Array.from(stats.unmatchedTeams).sort().map((team) => `- ${team}`).join('\n') : '- Ninguno'}

## Errores

${stats.errors.length ? stats.errors.slice(0, 50).map((error) => `- ${error}`).join('\n') : '- Sin errores'}

## Jugadores por equipo despues de importar

${playersByTeam ? Object.entries(playersByTeam).sort((a, b) => a[0].localeCompare(b[0])).map(([team, count]) => `- ${team}: ${count}`).join('\n') : '- No calculado'}
`,
    )
  }
}

async function main() {
  await loadEnvLocal()
  const admin = getAdminSupabaseClient()
  if (!admin) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY. No puedo importar jugadores.')
  }

  const csvRows = await readCsv(CSV_PATH)
  const { data: sampleRows, error: sampleError } = await admin.from('players_info').select('*').limit(1)
  if (sampleError) throw sampleError
  const columns = Object.keys(sampleRows?.[0] ?? {})
  const columnSet = new Set(columns)
  const { data: teamsData, error: teamsError } = await admin.from('teams_info').select('id,name,slug,fifa_code').order('name')
  if (teamsError) throw teamsError
  const teams = (teamsData ?? []) as DbTeam[]

  await writeReports(columns, csvRows, teams)

  const desiredPlayerColumns = [
    'id',
    'team_id',
    'team_slug',
    'name',
    'display_name',
    'slug',
    'position',
    'club',
    'date_of_birth',
    'birth_date',
    'nationality',
    'shirt_number',
    'photo_url',
    'photo_path',
    'photo_storage_path',
    'source_url',
    'last_verified_at',
    'status',
  ]
  const playerSelect = desiredPlayerColumns.filter((column) => columnSet.has(column)).join(',')
  const players = await fetchAllRows<DbPlayer>('players_info', playerSelect)
  const existingByTeamSlug = new Map<string, DbPlayer>()
  const existingByTeamName = new Map<string, DbPlayer>()
  for (const player of players) {
    if (player.team_id && player.slug) existingByTeamSlug.set(playerKey(player.team_id, player.slug), player)
    if (player.team_id && player.name) existingByTeamName.set(`${player.team_id}:${normalizeName(player.name)}`, player)
    if (player.team_id && player.display_name) existingByTeamName.set(`${player.team_id}:${normalizeName(player.display_name)}`, player)
  }

  const stats: ImportStats = {
    csvRows: csvRows.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    duplicates: 0,
    unmatchedTeams: new Set(),
    errors: [],
  }
  const seenCsv = new Set<string>()

  for (const row of csvRows) {
    const name = clean(row.name)
    if (!name) {
      stats.skipped += 1
      continue
    }
    const team = matchTeam(row, teams)
    if (!team) {
      stats.unmatchedTeams.add(row.team_slug || row.team_name || row.nationality || 'sin_equipo')
      stats.skipped += 1
      continue
    }
    const slug = clean(row.slug) ?? slugify(name)
    const csvKey = playerKey(team.id, slug)
    if (seenCsv.has(csvKey)) {
      stats.duplicates += 1
      stats.skipped += 1
      continue
    }
    seenCsv.add(csvKey)

    const existing = existingByTeamSlug.get(csvKey) ?? existingByTeamName.get(`${team.id}:${normalizeName(name)}`)
    const status = existing?.status === 'confirmed' ? 'confirmed' : 'pending_review'
    const dateValue = parseDate(row.date_of_birth)

    try {
      if (existing) {
        const updatePayload = pickColumns(columnSet, {
          display_name: shouldFill(existing.display_name) ? name : undefined,
          position: shouldFill(existing.position) ? clean(row.position) : undefined,
          club: shouldFill(existing.club) ? clean(row.club) : undefined,
          date_of_birth: shouldFill(existing.date_of_birth) ? dateValue : undefined,
          birth_date: shouldFill(existing.birth_date) ? dateValue : undefined,
          nationality: shouldFill(existing.nationality) ? clean(row.nationality) : undefined,
          source_url: shouldFill(existing.source_url) ? clean(row.source_url) ?? SOURCE_URL : undefined,
          status,
          updated_at: new Date().toISOString(),
        })
        if (Object.keys(updatePayload).length > 0) {
          const { error } = await admin.from('players_info').update(updatePayload).eq('id', existing.id)
          if (error) throw error
          stats.updated += 1
        } else {
          stats.skipped += 1
        }
      } else {
        const insertPayload = pickColumns(columnSet, {
          team_id: team.id,
          team_slug: team.slug,
          name,
          slug,
          display_name: name,
          position: clean(row.position),
          club: clean(row.club),
          date_of_birth: dateValue,
          birth_date: dateValue,
          nationality: clean(row.nationality) ?? team.name,
          source_url: clean(row.source_url) ?? SOURCE_URL,
          last_verified_at: null,
          status: 'pending_review',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        const { data, error } = await admin.from('players_info').insert(insertPayload).select('id,team_id,name,display_name,slug').single()
        if (error) throw error
        const inserted = data as DbPlayer
        existingByTeamSlug.set(csvKey, inserted)
        existingByTeamName.set(`${team.id}:${normalizeName(name)}`, inserted)
        stats.inserted += 1
      }
    } catch (error) {
      stats.errors.push(`${team.slug ?? team.name}:${name}: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
      stats.skipped += 1
    }
  }

  const finalPlayers = await fetchAllRows<{ team_id?: string | number | null }>('players_info', 'team_id')
  const teamNameById = new Map(teams.map((team) => [String(team.id), team.name ?? team.slug ?? String(team.id)]))
  const playersByTeam: Record<string, number> = {}
  for (const player of finalPlayers) {
    const key = teamNameById.get(String((player as { team_id?: string | number | null }).team_id)) ?? 'sin_equipo'
    playersByTeam[key] = (playersByTeam[key] ?? 0) + 1
  }

  await writeReports(columns, csvRows, teams, stats, playersByTeam)
  console.log(`Wikipedia reviewed players import listo. Insertados: ${stats.inserted}. Actualizados: ${stats.updated}. Omitidos: ${stats.skipped}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
