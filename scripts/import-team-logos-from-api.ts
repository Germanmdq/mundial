import { getApiFootballConfig, getTheSportsDbConfig } from '../src/lib/worldcup/external-api-config'
import { convertImageToWebp, CsvRow, downloadToBuffer, getAdminSupabaseClient, loadEnvLocal, readCsv, writeCsv } from './api-import-utils'

const INPUT = 'supabase/import/external_team_mappings.csv'
const REPORT = 'supabase/reports/api_team_logos_import_report.csv'
const HEADERS = ['team_slug', 'provider', 'source_logo_url', 'local_path', 'public_path', 'storage_path', 'uploaded', 'db_updated', 'notes']
const BUCKET = 'worldcup-assets'

async function getApiFootballLogo(teamId: string): Promise<string> {
  const config = getApiFootballConfig()
  if (!config.enabled || !teamId) return ''
  const response = await fetch(`${config.baseUrl}/teams?id=${encodeURIComponent(teamId)}`, { headers: config.headers })
  if (!response.ok) return ''
  const json = await response.json()
  return json.response?.[0]?.team?.logo ?? ''
}

async function getTheSportsDbLogo(teamId: string): Promise<string> {
  const config = getTheSportsDbConfig()
  if (!config.enabled || !teamId) return ''
  const response = await fetch(`${config.baseUrl}/lookupteam.php?id=${encodeURIComponent(teamId)}`)
  if (!response.ok) return ''
  const json = await response.json()
  const team = json.teams?.[0]
  return team?.strBadge ?? team?.strLogo ?? ''
}

async function main() {
  await loadEnvLocal()
  const mappings = await readCsv(INPUT)
  const supabase = getAdminSupabaseClient()
  const report: CsvRow[] = []

  if (mappings.length === 0) {
    await writeCsv(REPORT, HEADERS, [])
    console.log(`No hay mappings. Completar ${INPUT}.`)
    return
  }

  for (const row of mappings) {
    const teamSlug = row.team_slug
    if (!teamSlug) continue
    const provider = row.api_football_team_id ? 'api-football' : row.thesportsdb_team_id ? 'thesportsdb' : ''
    const logoUrl = row.api_football_team_id
      ? await getApiFootballLogo(row.api_football_team_id)
      : row.thesportsdb_team_id
        ? await getTheSportsDbLogo(row.thesportsdb_team_id)
        : ''

    const localPath = `assets/worldcup-assets/teams/${teamSlug}/crest.webp`
    const publicPath = `public/worldcup-assets/teams/${teamSlug}/crest.webp`
    const storagePath = `teams/${teamSlug}/crest.webp`
    const result: CsvRow = { team_slug: teamSlug, provider, source_logo_url: logoUrl, local_path: localPath, public_path: publicPath, storage_path: storagePath, uploaded: 'false', db_updated: 'false', notes: '' }

    if (!logoUrl) {
      result.notes = 'Sin logo_url o faltan provider ids/API keys.'
      report.push(result)
      continue
    }

    try {
      const buffer = await downloadToBuffer(logoUrl)
      await convertImageToWebp(buffer, localPath, publicPath, 800, 800)
      if (supabase) {
        const webp = await import('node:fs/promises').then((fs) => fs.readFile(localPath))
        const upload = await supabase.storage.from(BUCKET).upload(storagePath, webp, { contentType: 'image/webp', upsert: true })
        if (upload.error) throw upload.error
        result.uploaded = 'true'
        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
        const existing = await supabase.from('team_assets').select('id').eq('asset_type', 'crest').eq('storage_path', storagePath).maybeSingle()
        const payload = { asset_type: 'crest', url: publicUrl, storage_path: storagePath, is_primary: true }
        const dbResult = existing.data
          ? await supabase.from('team_assets').update(payload).eq('id', existing.data.id)
          : await supabase.from('team_assets').insert({ ...payload, alt_text: `Escudo de ${row.team_name || teamSlug}` })
        if (dbResult.error) throw dbResult.error
        result.db_updated = 'true'
      } else {
        result.notes = 'Sin SUPABASE_SERVICE_ROLE_KEY: solo preparado local.'
      }
    } catch (error) {
      result.notes = error instanceof Error ? error.message : String(error)
    }
    report.push(result)
  }

  await writeCsv(REPORT, HEADERS, report)
  console.log(`Reporte guardado en ${REPORT}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
