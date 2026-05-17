import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { convertImageToWebp, downloadToBuffer, getAdminSupabaseClient, getAnonSupabaseRows, loadEnvLocal, readCsv, writeCsv, type CsvRow } from './api-import-utils'

const REVIEW_CSV = 'supabase/import/wikimedia_player_photos_review.csv'
const WIKIPEDIA_PLAYERS_CSV = 'supabase/import/wikipedia_worldcup_players_review.csv'
const REPORT_PATH = 'supabase/reports/missing_assets_sources_report.md'
const BUCKET = 'worldcup-assets'

type TeamRow = { id: string | number; slug?: string | null }
type PlayerRow = { id?: string | number | null; team_id?: string | number | null; name?: string | null; slug?: string | null; photo_url?: string | null; photo_storage_path?: string | null }

function publicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${storagePath}` : ''
}

async function searchWikidata(name: string): Promise<string | null> {
  const url = new URL('https://www.wikidata.org/w/api.php')
  url.searchParams.set('action', 'wbsearchentities')
  url.searchParams.set('search', name)
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')
  const response = await fetch(url, { headers: { 'user-agent': 'mi-prediccion-photo-review/1.0' } })
  if (!response.ok) return null
  const json = (await response.json()) as { search?: Array<{ id?: string; description?: string }> }
  const hit = (json.search ?? []).find((item) => /football|soccer|player|association/i.test(item.description ?? '')) ?? json.search?.[0]
  return hit?.id ?? null
}

async function getCommonsImageFromWikidata(id: string): Promise<{ commonsFile: string; imageUrl: string } | null> {
  const response = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${id}.json`, { headers: { 'user-agent': 'mi-prediccion-photo-review/1.0' } })
  if (!response.ok) return null
  const json = (await response.json()) as { entities?: Record<string, { claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>> }> }
  const file = json.entities?.[id]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value
  if (!file) return null
  const infoUrl = new URL('https://commons.wikimedia.org/w/api.php')
  infoUrl.searchParams.set('action', 'query')
  infoUrl.searchParams.set('titles', `File:${file}`)
  infoUrl.searchParams.set('prop', 'imageinfo')
  infoUrl.searchParams.set('iiprop', 'url|extmetadata')
  infoUrl.searchParams.set('format', 'json')
  const infoResponse = await fetch(infoUrl, { headers: { 'user-agent': 'mi-prediccion-photo-review/1.0' } })
  if (!infoResponse.ok) return null
  const info = (await infoResponse.json()) as { query?: { pages?: Record<string, { imageinfo?: Array<{ url?: string }> }> } }
  const page = Object.values(info.query?.pages ?? {})[0]
  const imageUrl = page?.imageinfo?.[0]?.url
  return imageUrl ? { commonsFile: file, imageUrl } : null
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

async function loadPlayers(): Promise<Array<PlayerRow & { team_slug: string; player_name: string }>> {
  const wikipediaRows = await readCsv(WIKIPEDIA_PLAYERS_CSV)
  if (wikipediaRows.length > 0) {
    return wikipediaRows.map((row) => ({
      id: row.matched_player_id,
      name: row.name,
      slug: row.slug,
      team_slug: row.team_slug,
      player_name: row.name,
    }))
  }
  const teams = (await getAnonSupabaseRows('teams_info', 'id,slug')) as unknown as TeamRow[]
  const teamById = new Map(teams.map((team) => [String(team.id), team.slug ?? '']))
  const players = (await getAnonSupabaseRows('players_info', 'id,team_id,name,slug,photo_url,photo_storage_path')) as unknown as PlayerRow[]
  return players.map((player) => ({
    ...player,
    team_slug: teamById.get(String(player.team_id)) ?? '',
    player_name: player.name ?? '',
  }))
}

async function main() {
  await loadEnvLocal()
  const players = (await loadPlayers()).filter((player) => player.team_slug && player.slug && player.player_name)
  const admin = getAdminSupabaseClient()
  const rows: CsvRow[] = []
  let found = 0
  let downloaded = 0
  let uploaded = 0
  const errors: string[] = []

  for (const player of players) {
    let status = 'no_image'
    let wikidataId = ''
    let commonsFile = ''
    let imageUrl = ''
    let localPath = ''
    let storagePath = ''
    let notes = ''
    try {
      const id = await searchWikidata(player.player_name)
      wikidataId = id ?? ''
      const image = id ? await getCommonsImageFromWikidata(id) : null
      if (image) {
        found += 1
        commonsFile = image.commonsFile
        imageUrl = image.imageUrl
        localPath = `assets/worldcup-assets/players/${player.team_slug}/${player.slug}.webp`
        const publicPath = `public/worldcup-assets/players/${player.team_slug}/${player.slug}.webp`
        storagePath = `players/${player.team_slug}/${player.slug}.webp`
        const buffer = await downloadToBuffer(image.imageUrl)
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
      errors.push(`${player.player_name}: ${notes}`)
    }
    rows.push({
      team_slug: player.team_slug,
      player_slug: player.slug ?? '',
      player_name: player.player_name,
      wikidata_id: wikidataId,
      commons_file: commonsFile,
      image_url: imageUrl,
      license: '',
      attribution: commonsFile ? 'Wikimedia Commons metadata review required' : '',
      local_path: localPath,
      storage_path: storagePath,
      status,
      notes,
    })
  }

  await writeCsv(REVIEW_CSV, ['team_slug', 'player_slug', 'player_name', 'wikidata_id', 'commons_file', 'image_url', 'license', 'attribution', 'local_path', 'storage_path', 'status', 'notes'], rows)
  await appendReport(`## Wikimedia player photos\n\n- Jugadores revisados: ${players.length}\n- Fotos encontradas: ${found}\n- Fotos descargadas: ${downloaded}\n- Fotos subidas a Supabase: ${uploaded}\n- Service role presente: ${admin ? 'si' : 'no'}\n- CSV: \`${REVIEW_CSV}\`\n- Errores: ${errors.length ? errors.slice(0, 20).join(' | ') : 'sin errores'}`)
  console.log(`Wikimedia fotos listo. Revisados: ${players.length}. Encontradas: ${found}. Descargadas: ${downloaded}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
