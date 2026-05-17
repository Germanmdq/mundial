import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getAdminSupabaseClient, loadEnvLocal, writeCsv, slugify, type CsvRow } from './api-import-utils'

const BACKUP_PATH = 'supabase/backups/players_info_before_ocr_cleanup.csv'
const REVIEW_CSV = 'supabase/import/players_bogus_ocr_review.csv'
const CLEANUP_REPORT = 'supabase/reports/bogus_ocr_players_cleanup_report.md'
const DISTRIBUTION_REPORT = 'supabase/reports/players_distribution_audit.md'

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
  notes?: string | null
  status?: string | null
  photo_url?: string | null
  photo_path?: string | null
  photo_storage_path?: string | null
}

type TeamRow = {
  id: string | number
  name?: string | null
  slug?: string | null
}

const TRUSTED_SOURCE_PATTERN = /(wikipedia|wikidata|wikimedia|fifa\.com|thesportsdb|wc2026|api-sports|api-football|football-data)/i
const OCR_SOURCE_PATTERN = /(ocr|panini|pdf|placeholder)/i
const BOGUS_NAME_PATTERN = /\b(arnt|wtor|dibba|eee|mks|pogon|rahm|tesielh|eat zidane|lot|por confirmar|ocr)\b/i

function clean(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function normalize(value: unknown): string {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function hasPhoto(player: PlayerRow): boolean {
  return Boolean(clean(player.photo_url) || clean(player.photo_path) || clean(player.photo_storage_path))
}

function hasTrustedSource(player: PlayerRow): boolean {
  return TRUSTED_SOURCE_PATTERN.test(clean(player.source_url))
}

function hasHumanNameShape(name: string): boolean {
  const words = name
    .replace(/[.'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length < 2 || words.length > 5) return false
  return words.every((word) => /^[A-Za-zÀ-ÿ]{2,}$/.test(word))
}

function bogusReasons(player: PlayerRow): string[] {
  const reasons: string[] = []
  const name = clean(player.name)
  const textFields = `${clean(player.position)} ${clean(player.club)} ${clean(player.notes)} ${clean(player.source_url)}`
  const trusted = hasTrustedSource(player)

  if (/ocr|por confirmar \(ocr\)/i.test(clean(player.position))) reasons.push('position_contains_ocr')
  if (/ocr|por confirmar \(ocr\)/i.test(clean(player.club))) reasons.push('club_contains_ocr')
  if (OCR_SOURCE_PATTERN.test(clean(player.notes))) reasons.push('notes_contains_ocr_or_panini')
  if (OCR_SOURCE_PATTERN.test(clean(player.source_url))) reasons.push('source_contains_ocr_or_panini')
  if (!name || normalize(name).replace(/[^a-z]/g, '').length < 3) reasons.push('name_too_short')
  if (BOGUS_NAME_PATTERN.test(normalize(name))) reasons.push('known_bogus_name_pattern')
  if (!trusted && !hasHumanNameShape(name)) reasons.push('name_not_human_shape')
  if (!trusted && !clean(player.source_url) && /por confirmar/i.test(textFields)) reasons.push('pending_without_trusted_source_and_placeholder_fields')

  return Array.from(new Set(reasons))
}

function isStrongDeleteCandidate(player: PlayerRow, reasons: string[]): boolean {
  if (reasons.length === 0) return false
  if (hasTrustedSource(player)) return false
  if (hasPhoto(player)) return false
  return reasons.some((reason) =>
    [
      'position_contains_ocr',
      'club_contains_ocr',
      'notes_contains_ocr_or_panini',
      'source_contains_ocr_or_panini',
      'known_bogus_name_pattern',
      'name_too_short',
      'pending_without_trusted_source_and_placeholder_fields',
    ].includes(reason),
  )
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

async function deleteInBatches(ids: Array<string | number>) {
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.')
  let deleted = 0
  const errors: string[] = []
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100)
    const { error } = await admin.from('players_info').delete().in('id', batch)
    if (error) {
      errors.push(error.message)
    } else {
      deleted += batch.length
    }
  }
  return { deleted, errors }
}

async function markBogusInBatches(ids: Array<string | number>) {
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.')
  let marked = 0
  const errors: string[] = []
  for (let index = 0; index < ids.length; index += 100) {
    const batch = ids.slice(index, index + 100)
    const { error } = await admin.from('players_info').update({ status: 'bogus_ocr', updated_at: new Date().toISOString() }).in('id', batch)
    if (error) {
      errors.push(error.message)
    } else {
      marked += batch.length
    }
  }
  return { marked, errors }
}

async function main() {
  await loadEnvLocal()
  const admin = getAdminSupabaseClient()
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY. No puedo limpiar players_info.')

  await mkdir(path.dirname(BACKUP_PATH), { recursive: true })
  await mkdir(path.dirname(REVIEW_CSV), { recursive: true })
  await mkdir(path.dirname(CLEANUP_REPORT), { recursive: true })

  const players = await fetchAll<PlayerRow>('players_info', '*')
  if (players.length === 0) throw new Error('players_info no devolvio filas; no se creo limpieza.')
  const columns = Array.from(new Set(players.flatMap((row) => Object.keys(row)))).sort()
  const columnSet = new Set(columns)
  await writeCsv(BACKUP_PATH, columns, toCsvRows(players, columns))

  const { data: teamsData, error: teamsError } = await admin.from('teams_info').select('id,name,slug').order('name')
  if (teamsError) throw teamsError
  const teams = (teamsData ?? []) as TeamRow[]
  const teamById = new Map(teams.map((team) => [String(team.id), team]))

  const candidates = players
    .map((player) => ({ player, reasons: bogusReasons(player) }))
    .filter(({ reasons }) => reasons.length > 0)

  const reviewRows = candidates.map(({ player, reasons }) => {
    const strongDelete = isStrongDeleteCandidate(player, reasons)
    return {
      id: clean(player.id),
      team_id: clean(player.team_id),
      team_slug: clean(player.team_slug) || clean(teamById.get(String(player.team_id))?.slug),
      name: clean(player.name),
      slug: clean(player.slug),
      position: clean(player.position),
      club: clean(player.club),
      source_url: clean(player.source_url),
      notes: clean(player.notes),
      status: clean(player.status),
      reason: reasons.join('|'),
      action: strongDelete ? 'delete_candidate' : 'keep_candidate',
    }
  })
  await writeCsv(REVIEW_CSV, ['id', 'team_id', 'team_slug', 'name', 'slug', 'position', 'club', 'source_url', 'notes', 'status', 'reason', 'action'], reviewRows)

  const deleteIds = candidates
    .filter(({ player, reasons }) => isStrongDeleteCandidate(player, reasons))
    .map(({ player }) => player.id)
  const quarantineIds = candidates
    .filter(({ player, reasons }) => !isStrongDeleteCandidate(player, reasons) && reasons.length > 0)
    .map(({ player }) => player.id)
  const markResult = await markBogusInBatches(quarantineIds)
  const fallbackDeleteIds = markResult.errors.length > 0 ? quarantineIds : []
  const deleteResult = await deleteInBatches([...deleteIds, ...fallbackDeleteIds])

  const desiredRemainingColumns = [
    'id',
    'team_id',
    'team_slug',
    'name',
    'slug',
    'position',
    'club',
    'source_url',
    'notes',
    'status',
    'photo_url',
    'photo_path',
    'photo_storage_path',
  ]
  const remainingSelect = desiredRemainingColumns.filter((column) => columnSet.has(column)).join(',')
  const remaining = await fetchAll<PlayerRow>('players_info', remainingSelect)
  const remainingCandidates = remaining
    .map((player) => ({ player, reasons: bogusReasons(player) }))
    .filter(({ reasons }) => reasons.length > 0)

  const byTeam = new Map<string, number>()
  const missingPosition = remaining.filter((player) => !clean(player.position)).length
  const missingClub = remaining.filter((player) => !clean(player.club)).length
  const missingSource = remaining.filter((player) => !clean(player.source_url)).length
  const missingPhoto = remaining.filter((player) => !hasPhoto(player)).length
  const duplicateKeys = new Map<string, number>()

  for (const player of remaining) {
    const team = teamById.get(String(player.team_id))
    const key = clean(player.team_slug) || clean(team?.slug) || 'sin-equipo'
    byTeam.set(key, (byTeam.get(key) ?? 0) + 1)
    const duplicateKey = `${key}:${clean(player.slug) || slugify(clean(player.name))}`
    duplicateKeys.set(duplicateKey, (duplicateKeys.get(duplicateKey) ?? 0) + 1)
  }

  const duplicates = Array.from(duplicateKeys.entries()).filter(([, count]) => count > 1)
  const zeroTeams = teams.filter((team) => !byTeam.get(clean(team.slug)))
  const over55 = Array.from(byTeam.entries()).filter(([, count]) => count > 55)
  const over80 = Array.from(byTeam.entries()).filter(([, count]) => count > 80)
  const keptExamples = remaining
    .filter((player) => hasTrustedSource(player))
    .slice(0, 12)
    .map((player) => `${clean(player.name)} (${clean(teamById.get(String(player.team_id))?.slug) || 'sin-equipo'})`)
  const bogusExamples = candidates
    .slice(0, 20)
    .map(({ player, reasons }) => `${clean(player.name)}: ${reasons.join(', ')}`)

  await writeFile(
    CLEANUP_REPORT,
    `# Bogus OCR players cleanup report

- Total players_info antes: ${players.length}
- Candidatos OCR/basura: ${candidates.length}
- En cuarentena CSV: ${reviewRows.length}
- Marcados como bogus_ocr: ${markResult.marked}
- Eliminados fisicamente: ${deleteResult.deleted}
- Eliminados por fallback al fallar status bogus_ocr: ${fallbackDeleteIds.length}
- Total players_info restante: ${remaining.length}
- Candidatos sospechosos restantes: ${remainingCandidates.length}

## Errores

${[...markResult.errors, ...deleteResult.errors].length ? [...markResult.errors, ...deleteResult.errors].map((error) => `- ${error}`).join('\n') : '- Sin errores'}

## Ejemplos de basura detectada

${bogusExamples.length ? bogusExamples.map((item) => `- ${item}`).join('\n') : '- Ninguno'}

## Ejemplos conservados por fuente confiable

${keptExamples.length ? keptExamples.map((item) => `- ${item}`).join('\n') : '- Ninguno'}

## Jugadores por equipo despues

${Array.from(byTeam.entries())
  .sort((a, b) => b[1] - a[1])
  .map(([team, count]) => `- ${team}: ${count}`)
  .join('\n')}
`,
  )

  await writeFile(
    DISTRIBUTION_REPORT,
    `# Players distribution audit

- Total players_info: ${remaining.length}
- Equipos con 0 jugadores: ${zeroTeams.length}
- Equipos con mas de 55 jugadores: ${over55.length}
- Equipos con mas de 80 jugadores: ${over80.length}
- Posibles duplicados team_slug + slug: ${duplicates.length}
- Jugadores sin position: ${missingPosition}
- Jugadores sin club: ${missingClub}
- Jugadores sin source_url: ${missingSource}
- Jugadores sin foto en DB: ${missingPhoto}
- Candidatos OCR/basura restantes: ${remainingCandidates.length}

## Jugadores por seleccion

${Array.from(byTeam.entries())
  .sort((a, b) => b[1] - a[1])
  .map(([team, count]) => `- ${team}: ${count}`)
  .join('\n')}

## Equipos con 0 jugadores

${zeroTeams.length ? zeroTeams.map((team) => `- ${clean(team.name)} (${clean(team.slug)}): missing_squad_source`).join('\n') : '- Ninguno'}

## Equipos con mas de 55 jugadores

${over55.length ? over55.map(([team, count]) => `- ${team}: ${count}`).join('\n') : '- Ninguno'}

## Equipos con mas de 80 jugadores

${over80.length ? over80.map(([team, count]) => `- ${team}: ${count}`).join('\n') : '- Ninguno'}

## Duplicados posibles

${duplicates.length ? duplicates.slice(0, 120).map(([key, count]) => `- ${key}: ${count}`).join('\n') : '- Ninguno'}
`,
  )

  console.log(`Cleanup OCR listo. Antes: ${players.length}. Marcados: ${markResult.marked}. Eliminados: ${deleteResult.deleted}. Restantes: ${remaining.length}. Sospechosos restantes: ${remainingCandidates.length}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
