import { createClient } from '@supabase/supabase-js'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Team = { id: number | string; name: string; slug: string | null }
type AssetConfig = { assetType: string; localName: string; storageName: string; contentType: string; primary: boolean }

const BUCKET = 'worldcup-assets'
const REPORT_PATH = 'supabase/reports/team_assets_sync_report.md'
const ASSET_ROOT = 'assets/worldcup-assets/teams'
const ASSETS: AssetConfig[] = [
  { assetType: 'flag', localName: 'flag.svg', storageName: 'flag.svg', contentType: 'image/svg+xml', primary: true },
  { assetType: 'crest', localName: 'crest.webp', storageName: 'crest.webp', contentType: 'image/webp', primary: true },
  { assetType: 'hero_image', localName: 'hero.webp', storageName: 'hero.webp', contentType: 'image/webp', primary: false },
  { assetType: 'background', localName: 'background.webp', storageName: 'background.webp', contentType: 'image/webp', primary: false },
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
      '# Sync team assets',
      '',
      `Fecha: ${new Date().toISOString()}`,
      '',
      'No ejecutado porque falta `NEXT_PUBLIC_SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`.',
      'No se subio ningun archivo y no se modifico `team_assets`.',
    ])
    console.log('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. No se suben assets.')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket(BUCKET)
  if (bucketError || !bucket) throw bucketError ?? new Error(`No existe el bucket ${BUCKET}`)

  const { data: teams, error: teamsError } = await supabase.from('teams_info').select('id, name, slug').order('name')
  if (teamsError) throw teamsError

  const uploaded: string[] = []
  const alreadyExisting: string[] = []
  const missing: string[] = []
  const errors: string[] = []

  for (const team of (teams ?? []) as Team[]) {
    if (!team.slug) {
      errors.push(`${team.name}: falta slug`)
      continue
    }

    for (const config of ASSETS) {
      const localPath = path.join(ASSET_ROOT, team.slug, config.localName)
      const storagePath = `teams/${team.slug}/${config.storageName}`
      if (!(await exists(localPath))) {
        missing.push(localPath)
        continue
      }

      const previous = await supabase.storage.from(BUCKET).download(storagePath)
      if (!previous.error) alreadyExisting.push(storagePath)

      const file = await readFile(localPath)
      const upload = await supabase.storage.from(BUCKET).upload(storagePath, file, {
        contentType: config.contentType,
        upsert: true,
      })

      if (upload.error) {
        errors.push(`${storagePath}: ${upload.error.message}`)
        continue
      }

      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
      const { data: existingAsset, error: existingError } = await supabase
        .from('team_assets')
        .select('id')
        .eq('team_id', team.id)
        .eq('asset_type', config.assetType)
        .maybeSingle()

      if (existingError) {
        errors.push(`${storagePath}: ${existingError.message}`)
        continue
      }

      const payload = {
        team_id: team.id,
        asset_type: config.assetType,
        url: publicUrl,
        storage_path: storagePath,
        alt_text: `${config.assetType} de ${team.name}`,
        is_primary: config.primary,
      }

      const result = existingAsset
        ? await supabase.from('team_assets').update(payload).eq('id', existingAsset.id)
        : await supabase.from('team_assets').insert(payload)

      if (result.error) errors.push(`${storagePath}: ${result.error.message}`)
      else uploaded.push(storagePath)
    }
  }

  const completeTeams = ((teams ?? []) as Team[]).filter((team) =>
    team.slug && ASSETS.every((config) => uploaded.includes(`teams/${team.slug}/${config.storageName}`) || alreadyExisting.includes(`teams/${team.slug}/${config.storageName}`)),
  )

  await writeReport([
    '# Sync team assets',
    '',
    `Fecha: ${new Date().toISOString()}`,
    '',
    `- Subidos/actualizados correctamente: ${uploaded.length}`,
    `- Ya existentes antes de subir: ${alreadyExisting.length}`,
    `- Faltantes locales: ${missing.length}`,
    `- Errores: ${errors.length}`,
    `- Equipos completos por archivos locales/procesados: ${completeTeams.length}`,
    `- Equipos incompletos: ${((teams ?? []) as Team[]).length - completeTeams.length}`,
    '',
    '## Faltantes locales',
    '',
    ...(missing.length ? missing.map((item) => `- ${item}`) : ['- Ninguno.']),
    '',
    '## Errores',
    '',
    ...(errors.length ? errors.map((item) => `- ${item}`) : ['- Ninguno.']),
  ])

  console.log(`Sync listo: ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
