import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { convertImageToWebp, downloadToBuffer, getAdminSupabaseClient, getAnonSupabaseRows, loadEnvLocal, slugify, writeCsv, type CsvRow } from './api-import-utils'

const TEAMS_CACHE = 'supabase/import/api-cache/wc2026api/teams.json'
const REVIEW_CSV = 'supabase/import/thesportsdb_team_badges_review.csv'
const REPORT_PATH = 'supabase/reports/missing_assets_sources_report.md'
const BUCKET = 'worldcup-assets'

type WcTeam = { id: number; name: string; code?: string | null }
type TeamRow = { id: string | number; name?: string | null; slug?: string | null; fifa_code?: string | null }
type SportsDbTeam = { idTeam?: string; strTeam?: string; strBadge?: string; strLogo?: string; strSport?: string }

const ALIASES: Record<string, string[]> = {
  USA: ['United States', 'USA', 'USMNT'],
  KOR: ['South Korea', 'Korea Republic'],
  IRN: ['Iran', 'IR Iran'],
  TUR: ['Turkey', 'Türkiye'],
  CIV: ["Ivory Coast", "Côte d'Ivoire"],
  CPV: ['Cape Verde', 'Cabo Verde'],
  COD: ['DR Congo', 'Congo DR', 'Democratic Republic of the Congo'],
  ENG: ['England'],
  SCO: ['Scotland'],
}

function publicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${storagePath}` : ''
}

function normalize(value: string | null | undefined) {
  return slugify(value).replace(/-/g, ' ')
}

function scoreCandidate(team: WcTeam, candidate: SportsDbTeam): number {
  const candidateName = normalize(candidate.strTeam)
  const names = [team.name, ...(team.code ? ALIASES[team.code] ?? [] : [])].map(normalize)
  if (names.includes(candidateName)) return 100
  if (names.some((name) => candidateName.includes(name) || name.includes(candidateName))) return 88
  return 0
}

async function searchSportsDb(key: string, query: string): Promise<SportsDbTeam[]> {
  const url = new URL(`https://www.thesportsdb.com/api/v1/json/${key}/searchteams.php`)
  url.searchParams.set('t', query)
  const response = await fetch(url.toString())
  if (!response.ok) return []
  const json = (await response.json()) as { teams?: SportsDbTeam[] | null }
  return json.teams ?? []
}

function matchTeam(apiTeam: WcTeam, teams: TeamRow[]): TeamRow | null {
  const code = apiTeam.code?.toLowerCase()
  const name = slugify(apiTeam.name)
  return teams.find((team) => code && team.fifa_code?.toLowerCase() === code) ?? teams.find((team) => slugify(team.name) === name || slugify(team.slug) === name) ?? null
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
  let found = 0
  let downloaded = 0
  let uploaded = 0
  const errors: string[] = []

  if (!key) {
    await writeCsv(REVIEW_CSV, ['team_slug', 'team_name', 'provider_team_id', 'provider_team_name', 'badge_url', 'match_confidence', 'status', 'notes'], [])
    await appendReport(`## TheSportsDB team badges\n\n- THESPORTSDB_API_KEY presente: no\n- Badges encontrados: 0\n- Requiere key para ejecutar.\n- CSV: \`${REVIEW_CSV}\``)
    console.log('Falta THESPORTSDB_API_KEY. No se importan badges.')
    return
  }

  const apiTeams = JSON.parse(await readFile(TEAMS_CACHE, 'utf8')) as WcTeam[]
  const dbTeams = (await getAnonSupabaseRows('teams_info', 'id,name,slug,fifa_code')) as unknown as TeamRow[]
  const admin = getAdminSupabaseClient()

  for (const apiTeam of apiTeams) {
    const dbTeam = matchTeam(apiTeam, dbTeams)
    const teamSlug = dbTeam?.slug ?? slugify(apiTeam.name)
    const queries = [apiTeam.name, ...(apiTeam.code ? ALIASES[apiTeam.code] ?? [] : [])]
    const candidates: SportsDbTeam[] = []
    for (const query of queries) candidates.push(...(await searchSportsDb(key, query)))
    const scored = candidates
      .map((candidate) => ({ candidate, confidence: scoreCandidate(apiTeam, candidate) }))
      .filter((item) => item.confidence >= 90 && (item.candidate.strBadge || item.candidate.strLogo))
      .sort((a, b) => b.confidence - a.confidence)
    const best = scored[0]
    let status = 'no_match'
    let notes = ''
    if (scored.length > 1 && scored[0].confidence === scored[1].confidence && scored[0].candidate.idTeam !== scored[1].candidate.idTeam) {
      status = 'ambiguous'
    } else if (best) {
      status = 'matched'
      found += 1
      const badgeUrl = best.candidate.strBadge ?? best.candidate.strLogo ?? ''
      try {
        const buffer = await downloadToBuffer(badgeUrl)
        const localPath = `assets/worldcup-assets/teams/${teamSlug}/crest.webp`
        const publicPath = `public/worldcup-assets/teams/${teamSlug}/crest.webp`
        await convertImageToWebp(buffer, localPath, publicPath, 800, 800)
        downloaded += 1
        if (admin && dbTeam?.id) {
          const storagePath = `teams/${teamSlug}/crest.webp`
          const file = await readFile(localPath)
          const upload = await admin.storage.from(BUCKET).upload(storagePath, file, { contentType: 'image/webp', upsert: true })
          if (upload.error) throw upload.error
          uploaded += 1
          const upsert = await admin.from('team_assets').upsert({ team_id: dbTeam.id, asset_type: 'crest', storage_path: storagePath, url: publicUrl(storagePath), is_primary: true, updated_at: new Date().toISOString() }, { onConflict: 'team_id,asset_type' })
          if (upsert.error) throw upsert.error
          status = 'uploaded'
        }
      } catch (error) {
        status = 'error'
        notes = error instanceof Error ? error.message : String(error)
        errors.push(`${apiTeam.name}: ${notes}`)
      }
    }
    rows.push({
      team_slug: teamSlug,
      team_name: apiTeam.name,
      provider_team_id: best?.candidate.idTeam ?? '',
      provider_team_name: best?.candidate.strTeam ?? '',
      badge_url: best?.candidate.strBadge ?? best?.candidate.strLogo ?? '',
      match_confidence: String(best?.confidence ?? 0),
      status,
      notes,
    })
  }

  await writeCsv(REVIEW_CSV, ['team_slug', 'team_name', 'provider_team_id', 'provider_team_name', 'badge_url', 'match_confidence', 'status', 'notes'], rows)
  await appendReport(`## TheSportsDB team badges\n\n- THESPORTSDB_API_KEY presente: si\n- Badges encontrados: ${found}\n- Badges descargados: ${downloaded}\n- Badges subidos a Supabase: ${uploaded}\n- Service role presente: ${admin ? 'si' : 'no'}\n- CSV: \`${REVIEW_CSV}\`\n- Errores: ${errors.length ? errors.join(' | ') : 'sin errores'}`)
  console.log(`Badges TheSportsDB listos. Encontrados: ${found}. Descargados: ${downloaded}. Subidos: ${uploaded}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
