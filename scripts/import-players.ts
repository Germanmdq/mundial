import { createClient } from '@supabase/supabase-js'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Team = { id: number | string; name: string; slug: string | null }
type CsvRow = Record<string, string>

const BUCKET = 'worldcup-assets'
const INPUT_PATH = process.argv[2] ?? 'supabase/import/players_official_template.csv'
const REPORT_PATH = 'supabase/reports/players_import_report.md'
const REQUIRED_HEADERS = [
  'team_slug',
  'team_id',
  'name',
  'slug',
  'shirt_number',
  'position',
  'club',
  'date_of_birth',
  'nationality',
  'photo_local_path',
  'photo_storage_path',
  'source_url',
  'last_verified_at',
  'status',
]

async function loadEnvLocal() {
  try {
    const env = await readFile('.env.local', 'utf8')
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
    }
  } catch {
    // .env.local is optional for CI/admin environments.
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0])
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header))
  if (missingHeaders.length > 0) {
    throw new Error(`Faltan columnas obligatorias: ${missingHeaders.join(', ')}`)
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

function clean(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function hasFullName(name: string | null): boolean {
  return Boolean(name && name.trim().split(/\s+/).length >= 2)
}

async function exists(filePath: string) {
  try {
    const result = await stat(filePath)
    return result.isFile()
  } catch {
    return false
  }
}

async function writeReport(lines: string[]) {
  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await writeFile(REPORT_PATH, `${lines.join('\n')}\n`)
}

async function main() {
  await loadEnvLocal()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    await writeReport([
      '# Import jugadores',
      '',
      `Fecha: ${new Date().toISOString()}`,
      '',
      'No ejecutado porque falta `NEXT_PUBLIC_SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`.',
      'No se importaron jugadores y no se subieron fotos.',
    ])
    console.log('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. No se importan jugadores.')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const [{ data: teams, error: teamsError }, csvContent] = await Promise.all([
    supabase.from('teams_info').select('id, name, slug').order('name'),
    readFile(INPUT_PATH, 'utf8'),
  ])

  if (teamsError) throw teamsError

  const rows = parseCsv(csvContent)
  const teamsList = (teams ?? []) as Team[]
  const teamsBySlug = new Map(teamsList.filter((team) => team.slug).map((team) => [team.slug, team]))
  const teamsById = new Map(teamsList.map((team) => [String(team.id), team]))

  let imported = 0
  let updated = 0
  let photosUploaded = 0
  let withoutPhoto = 0
  let confirmed = 0
  let pending = 0
  const errors: string[] = []

  for (const row of rows) {
    const name = clean(row.name)
    const requestedTeam = clean(row.team_id) ? teamsById.get(String(clean(row.team_id))) : teamsBySlug.get(clean(row.team_slug) ?? '')

    if (!requestedTeam) {
      errors.push(`${name ?? 'sin nombre'}: equipo invalido`)
      continue
    }

    if (!name) {
      errors.push(`${requestedTeam.name}: falta nombre`)
      continue
    }

    const sourceUrl = clean(row.source_url)
    const lastVerifiedAt = clean(row.last_verified_at)
    const requestedStatus = clean(row.status)
    const status = requestedStatus === 'confirmed' && sourceUrl && lastVerifiedAt && hasFullName(name) ? 'confirmed' : 'pending_review'
    if (status === 'confirmed') confirmed += 1
    else pending += 1

    let photoStoragePath = clean(row.photo_storage_path)
    const localPhoto = clean(row.photo_local_path)

    if (localPhoto && (await exists(localPhoto))) {
      photoStoragePath = photoStoragePath ?? `players/${requestedTeam.slug}/${clean(row.slug) ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`
      const file = await readFile(localPhoto)
      const upload = await supabase.storage.from(BUCKET).upload(photoStoragePath, file, {
        contentType: 'image/webp',
        upsert: true,
      })
      if (upload.error) errors.push(`${name}: ${upload.error.message}`)
      else photosUploaded += 1
    } else {
      withoutPhoto += 1
    }

    const payload = {
      team_id: requestedTeam.id,
      name,
      slug: clean(row.slug),
      shirt_number: clean(row.shirt_number),
      position: clean(row.position),
      club: clean(row.club),
      birth_date: clean(row.date_of_birth),
      nationality: clean(row.nationality),
      photo_storage_path: photoStoragePath,
      source_url: sourceUrl,
      last_verified_at: lastVerifiedAt,
      status,
    }

    const query = supabase.from('players_info').select('id').eq('team_id', requestedTeam.id)
    const existing = payload.slug
      ? await query.eq('slug', payload.slug).maybeSingle()
      : await query.eq('name', name).maybeSingle()

    if (existing.error) {
      errors.push(`${name}: ${existing.error.message}`)
      continue
    }

    const result = existing.data
      ? await supabase.from('players_info').update(payload).eq('id', existing.data.id)
      : await supabase.from('players_info').insert(payload)

    if (result.error) errors.push(`${name}: ${result.error.message}`)
    else if (existing.data) updated += 1
    else imported += 1
  }

  await writeReport([
    '# Import jugadores',
    '',
    `Fecha: ${new Date().toISOString()}`,
    '',
    `- Jugadores importados: ${imported}`,
    `- Jugadores actualizados: ${updated}`,
    `- Fotos subidas: ${photosUploaded}`,
    `- Jugadores sin foto: ${withoutPhoto}`,
    `- Jugadores confirmados: ${confirmed}`,
    `- Jugadores pendientes: ${pending}`,
    `- Errores de validacion/importacion: ${errors.length}`,
    '',
    '## Errores',
    '',
    ...(errors.length ? errors.map((error) => `- ${error}`) : ['- Ninguno.']),
  ])

  console.log(`Import listo: ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
