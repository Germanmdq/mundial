import { createClient } from '@supabase/supabase-js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Team = { id: number | string; name: string; slug: string | null }
type TeamAsset = { id: number | string; team_id: number | string; asset_type: string; storage_path: string | null; url: string | null }
type StorageItem = { name: string; id?: string | null; metadata?: Record<string, unknown> | null }

const BUCKET = 'worldcup-assets'
const REPORT_PATH = 'supabase/reports/worldcup_storage_audit.md'

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
      '# Auditoria de Storage worldcup-assets',
      '',
      `Fecha: ${new Date().toISOString()}`,
      '',
      'No ejecutada contra Storage porque falta `NEXT_PUBLIC_SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`.',
      'La service role key debe usarse solo en scripts admin locales y nunca en frontend.',
    ])
    console.log('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Reporte generado sin tocar Supabase.')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const [{ data: teams, error: teamsError }, { data: assets, error: assetsError }] = await Promise.all([
    supabase.from('teams_info').select('id, name, slug').order('name'),
    supabase.from('team_assets').select('id, team_id, asset_type, storage_path, url'),
  ])

  if (teamsError) throw teamsError
  if (assetsError) throw assetsError

  const files: string[] = []
  async function listRecursive(prefix = ''): Promise<void> {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error

    for (const item of (data ?? []) as StorageItem[]) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name
      const looksLikeFile = Boolean(item.id) || /\.[a-z0-9]+$/i.test(item.name)
      if (looksLikeFile) files.push(fullPath)
      else await listRecursive(fullPath)
    }
  }

  await listRecursive()

  const assetRows = (assets ?? []) as TeamAsset[]
  const storageSet = new Set(files)
  const dbPaths = assetRows.map((asset) => asset.storage_path).filter((value): value is string => Boolean(value))
  const dbPathSet = new Set(dbPaths)
  const dbWithoutFile = assetRows.filter((asset) => asset.storage_path && !storageSet.has(asset.storage_path))
  const filesWithoutDb = files.filter((file) => !dbPathSet.has(file))
  const duplicatedPaths = dbPaths.filter((file, index) => dbPaths.indexOf(file) !== index)
  const teamsList = (teams ?? []) as Team[]
  const expectedTypes = ['flag', 'crest', 'hero_image', 'background']
  const incompleteTeams = teamsList.filter((team) => {
    const teamAssets = assetRows.filter((asset) => String(asset.team_id) === String(team.id))
    return expectedTypes.some((type) => !teamAssets.some((asset) => asset.asset_type === type && asset.storage_path && storageSet.has(asset.storage_path)))
  })

  await writeReport([
    '# Auditoria de Storage worldcup-assets',
    '',
    `Fecha: ${new Date().toISOString()}`,
    '',
    `- Equipos: ${teamsList.length}`,
    `- Registros team_assets: ${assetRows.length}`,
    `- Archivos fisicos en bucket: ${files.length}`,
    `- Registros DB sin archivo fisico: ${dbWithoutFile.length}`,
    `- Archivos fisicos sin registro DB: ${filesWithoutDb.length}`,
    `- Paths duplicados en DB: ${new Set(duplicatedPaths).size}`,
    `- Equipos incompletos: ${incompleteTeams.length}`,
    '',
    '## Registros DB sin archivo fisico',
    '',
    ...(dbWithoutFile.length ? dbWithoutFile.map((asset) => `- ${asset.asset_type}: ${asset.storage_path}`) : ['- Ninguno.']),
    '',
    '## Archivos fisicos sin registro DB',
    '',
    ...(filesWithoutDb.length ? filesWithoutDb.map((file) => `- ${file}`) : ['- Ninguno.']),
    '',
    '## Equipos incompletos',
    '',
    ...(incompleteTeams.length ? incompleteTeams.map((team) => `- ${team.name} (${team.slug ?? 'sin-slug'})`) : ['- Ninguno.']),
  ])

  console.log(`Auditoria lista: ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
