import { CsvRow, convertImageToWebp, downloadToBuffer, getAdminSupabaseClient, loadEnvLocal, readCsv, writeCsv } from './api-import-utils'

const INPUT = 'supabase/import/api_players_review.csv'
const REPORT = 'supabase/reports/api_player_photos_import_report.csv'
const HEADERS = ['team_slug', 'player_slug', 'source_url', 'local_path', 'public_path', 'storage_path', 'uploaded', 'db_updated', 'notes']
const BUCKET = 'worldcup-assets'

function extractMatchedPlayerId(notes: string): string {
  return notes.match(/matched_player_id=([^;]+)/)?.[1] ?? ''
}

async function main() {
  await loadEnvLocal()
  const rows = await readCsv(INPUT)
  const supabase = getAdminSupabaseClient()
  const report: CsvRow[] = []

  for (const row of rows.filter((item) => item.photo_url_external)) {
    const teamSlug = row.team_slug
    const playerSlug = row.slug
    const localPath = `assets/worldcup-assets/players/${teamSlug}/${playerSlug}.webp`
    const publicPath = `public/worldcup-assets/players/${teamSlug}/${playerSlug}.webp`
    const storagePath = `players/${teamSlug}/${playerSlug}.webp`
    const result: CsvRow = { team_slug: teamSlug, player_slug: playerSlug, source_url: row.photo_url_external, local_path: localPath, public_path: publicPath, storage_path: storagePath, uploaded: 'false', db_updated: 'false', notes: '' }

    try {
      const buffer = await downloadToBuffer(row.photo_url_external)
      await convertImageToWebp(buffer, localPath, publicPath, 800, 1000)
      if (supabase) {
        const webp = await import('node:fs/promises').then((fs) => fs.readFile(localPath))
        const upload = await supabase.storage.from(BUCKET).upload(storagePath, webp, { contentType: 'image/webp', upsert: true })
        if (upload.error) throw upload.error
        result.uploaded = 'true'
        const playerId = extractMatchedPlayerId(row.notes)
        if (playerId) {
          const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
          const update = await supabase
            .from('players_info')
            .update({ photo_storage_path: storagePath, photo_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', playerId)
          if (update.error) throw update.error
          result.db_updated = 'true'
        } else {
          result.notes = 'Sin matched_player_id fuerte: no se actualizo DB.'
        }
      } else {
        result.notes = 'Sin SUPABASE_SERVICE_ROLE_KEY: solo preparado local.'
      }
    } catch (error) {
      result.notes = error instanceof Error ? error.message : String(error)
    }
    report.push(result)
  }

  await writeCsv(REPORT, HEADERS, report)
  console.log(`Reporte fotos guardado en ${REPORT}: ${report.length}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
