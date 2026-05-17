import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { convertImageToWebp, downloadToBuffer, getAdminSupabaseClient, getAnonSupabaseRows, loadEnvLocal, writeCsv, type CsvRow } from './api-import-utils'

const REVIEW_CSV = 'supabase/import/thesportsdb_player_photos_review.csv'
const REPORT_PATH = 'supabase/reports/missing_assets_sources_report.md'
const BUCKET = 'worldcup-assets'

type TeamRow = { id: string | number; slug?: string | null }
type PlayerRow = { id?: string | number | null; team_id?: string | number | null; name?: string | null; slug?: string | null }
type SportsDbPlayer = { idPlayer?: string; strPlayer?: string; strSport?: string; strThumb?: string; strCutout?: string; strTeam?: string }

function publicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${storagePath}` : ''
}

async function searchPlayer(key: string, name: string): Promise<SportsDbPlayer[]> {
  const url = new URL(`https://www.thesportsdb.com/api/v1/json/${key}/searchplayers.php`)
  url.searchParams.set('p', name)
  const response = await fetch(url.toString())
  if (!response.ok) return []
  const json = (await response.json()) as { player?: SportsDbPlayer[] | null }
  return json.player ?? []
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
  const key = process.env.THESPORTSDB_API_KEY?.trim()
  const rows: CsvRow[] = []
  if (!key) {
    await writeCsv(REVIEW_CSV, ['team_slug', 'player_slug', 'player_name', 'provider_player_id', 'provider_player_name', 'image_url', 'match_confidence', 'status', 'notes'], [])
    await appendReport(`## TheSportsDB player photos\n\n- THESPORTSDB_API_KEY presente: no\n- Requiere key para ejecutar.\n- CSV: \`${REVIEW_CSV}\``)
    console.log('Falta THESPORTSDB_API_KEY. No se importan fotos de jugadores.')
    return
  }

  const teams = (await getAnonSupabaseRows('teams_info', 'id,slug')) as unknown as TeamRow[]
  const teamById = new Map(teams.map((team) => [String(team.id), team.slug ?? '']))
  const players = (await getAnonSupabaseRows('players_info', 'id,team_id,name,slug')) as unknown as PlayerRow[]
  const admin = getAdminSupabaseClient()
  let found = 0
  let downloaded = 0
  let uploaded = 0
  const errors: string[] = []

  for (const player of players) {
    const teamSlug = teamById.get(String(player.team_id)) ?? ''
    const name = player.name ?? ''
    const playerSlug = player.slug ?? ''
    if (!teamSlug || !name || !playerSlug) continue
    let status = 'no_match'
    let notes = ''
    let providerId = ''
    let providerName = ''
    let imageUrl = ''
    try {
      const candidates = (await searchPlayer(key, name)).filter((item) => /soccer|football/i.test(item.strSport ?? ''))
      const exact = candidates.find((item) => (item.strPlayer ?? '').toLowerCase() === name.toLowerCase()) ?? candidates[0]
      if (exact && (exact.strCutout || exact.strThumb)) {
        providerId = exact.idPlayer ?? ''
        providerName = exact.strPlayer ?? ''
        imageUrl = exact.strCutout ?? exact.strThumb ?? ''
        found += 1
        const localPath = `assets/worldcup-assets/players/${teamSlug}/${playerSlug}.webp`
        const publicPath = `public/worldcup-assets/players/${teamSlug}/${playerSlug}.webp`
        const storagePath = `players/${teamSlug}/${playerSlug}.webp`
        const buffer = await downloadToBuffer(imageUrl)
        await convertImageToWebp(buffer, localPath, publicPath, 800, 1000)
        downloaded += 1
        status = 'downloaded'
        if (admin && player.id) {
          const file = await readFile(localPath)
          const upload = await admin.storage.from(BUCKET).upload(storagePath, file, { contentType: 'image/webp', upsert: true })
          if (upload.error) throw upload.error
          const update = await admin.from('players_info').update({ photo_storage_path: storagePath, photo_url: publicUrl(storagePath), updated_at: new Date().toISOString() }).eq('id', player.id)
          if (update.error) throw update.error
          uploaded += 1
          status = 'uploaded'
        }
      }
    } catch (error) {
      status = 'error'
      notes = error instanceof Error ? error.message : String(error)
      errors.push(`${name}: ${notes}`)
    }
    rows.push({
      team_slug: teamSlug,
      player_slug: playerSlug,
      player_name: name,
      provider_player_id: providerId,
      provider_player_name: providerName,
      image_url: imageUrl,
      match_confidence: providerName ? '90' : '0',
      status,
      notes,
    })
  }

  await writeCsv(REVIEW_CSV, ['team_slug', 'player_slug', 'player_name', 'provider_player_id', 'provider_player_name', 'image_url', 'match_confidence', 'status', 'notes'], rows)
  await appendReport(`## TheSportsDB player photos\n\n- THESPORTSDB_API_KEY presente: si\n- Fotos encontradas: ${found}\n- Fotos descargadas: ${downloaded}\n- Fotos subidas a Supabase: ${uploaded}\n- Service role presente: ${admin ? 'si' : 'no'}\n- CSV: \`${REVIEW_CSV}\`\n- Errores: ${errors.length ? errors.slice(0, 20).join(' | ') : 'sin errores'}`)
  console.log(`TheSportsDB fotos listo. Encontradas: ${found}. Descargadas: ${downloaded}. Subidas: ${uploaded}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
