import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getAdminSupabaseClient, getAnonSupabaseRows, loadEnvLocal, slugify, writeCsv, type CsvRow } from './api-import-utils'

const TEAMS_CACHE = 'supabase/import/api-cache/wc2026api/teams.json'
const REVIEW_CSV = 'supabase/import/team_country_codes_review.csv'
const REPORT_PATH = 'supabase/reports/missing_assets_sources_report.md'
const BUCKET = 'worldcup-assets'

type WcTeam = {
  id: number
  name: string
  code?: string | null
}

type TeamRow = {
  id: string | number
  name?: string | null
  slug?: string | null
  fifa_code?: string | null
}

const FIFA_TO_ISO2: Record<string, string> = {
  CZE: 'cz',
  KOR: 'kr',
  MEX: 'mx',
  RSA: 'za',
  BIH: 'ba',
  CAN: 'ca',
  QAT: 'qa',
  SUI: 'ch',
  BRA: 'br',
  HAI: 'ht',
  MAR: 'ma',
  SCO: 'gb-sct',
  AUS: 'au',
  PAR: 'py',
  TUR: 'tr',
  USA: 'us',
  CIV: 'ci',
  CUW: 'cw',
  ECU: 'ec',
  GER: 'de',
  JPN: 'jp',
  NED: 'nl',
  SWE: 'se',
  TUN: 'tn',
  BEL: 'be',
  EGY: 'eg',
  IRN: 'ir',
  NZL: 'nz',
  CPV: 'cv',
  KSA: 'sa',
  ESP: 'es',
  URU: 'uy',
  FRA: 'fr',
  IRQ: 'iq',
  NOR: 'no',
  SEN: 'sn',
  ALG: 'dz',
  ARG: 'ar',
  AUT: 'at',
  JOR: 'jo',
  COL: 'co',
  COD: 'cd',
  POR: 'pt',
  UZB: 'uz',
  CRO: 'hr',
  ENG: 'gb-eng',
  GHA: 'gh',
  PAN: 'pa',
}

function publicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${storagePath}` : ''
}

async function loadTeams(): Promise<WcTeam[]> {
  const text = await readFile(TEAMS_CACHE, 'utf8')
  return JSON.parse(text) as WcTeam[]
}

function matchTeam(apiTeam: WcTeam, teams: TeamRow[]): TeamRow | null {
  const code = apiTeam.code?.toLowerCase()
  const name = slugify(apiTeam.name)
  return (
    teams.find((team) => code && team.fifa_code?.toLowerCase() === code) ??
    teams.find((team) => slugify(team.name) === name || slugify(team.slug) === name) ??
    null
  )
}

async function appendReport(section: string) {
  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  let existing = ''
  try {
    existing = await readFile(REPORT_PATH, 'utf8')
  } catch {
    existing = '# Missing assets sources report\n\n'
  }
  await writeFile(REPORT_PATH, `${existing.trim()}\n\n${section}\n`)
}

async function main() {
  await loadEnvLocal()
  const apiTeams = await loadTeams()
  const dbTeams = (await getAnonSupabaseRows('teams_info', 'id,name,slug,fifa_code')) as unknown as TeamRow[]
  const admin = getAdminSupabaseClient()
  const rows: CsvRow[] = []
  let downloaded = 0
  let uploaded = 0
  let missing = 0
  const errors: string[] = []

  for (const apiTeam of apiTeams) {
    const dbTeam = matchTeam(apiTeam, dbTeams)
    const teamSlug = dbTeam?.slug ?? slugify(apiTeam.name)
    const iso = apiTeam.code ? FIFA_TO_ISO2[apiTeam.code] : null
    const flagUrl = iso ? `https://flagcdn.com/${iso}.svg` : ''
    let status = iso ? 'pending' : 'missing_iso_code'
    let notes = ''

    if (!iso) {
      missing += 1
    } else {
      try {
        const response = await fetch(flagUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const svg = await response.text()
        const localPath = `assets/worldcup-assets/teams/${teamSlug}/flag.svg`
        const publicPath = `public/worldcup-assets/teams/${teamSlug}/flag.svg`
        await mkdir(path.dirname(localPath), { recursive: true })
        await mkdir(path.dirname(publicPath), { recursive: true })
        await writeFile(localPath, svg)
        await writeFile(publicPath, svg)
        downloaded += 1
        status = 'downloaded'

        if (admin && dbTeam?.id) {
          const storagePath = `teams/${teamSlug}/flag.svg`
          const upload = await admin.storage.from(BUCKET).upload(storagePath, Buffer.from(svg), {
            contentType: 'image/svg+xml',
            upsert: true,
          })
          if (upload.error) throw upload.error
          uploaded += 1
          const upsert = await admin.from('team_assets').upsert(
            {
              team_id: dbTeam.id,
              asset_type: 'flag',
              storage_path: storagePath,
              url: publicUrl(storagePath),
              is_primary: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'team_id,asset_type' },
          )
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
      api_code: apiTeam.code ?? '',
      country: apiTeam.name,
      iso_alpha2: iso ?? '',
      flag_url: flagUrl,
      status,
      notes,
    })
  }

  await writeCsv(REVIEW_CSV, ['team_slug', 'team_name', 'api_code', 'country', 'iso_alpha2', 'flag_url', 'status', 'notes'], rows)
  await appendReport(`## FlagCDN flags\n\n- Fuente: FlagCDN / Flagpedia\n- Flags descargadas: ${downloaded}\n- Flags subidas a Supabase: ${uploaded}\n- Missing ISO code: ${missing}\n- Service role presente: ${admin ? 'si' : 'no'}\n- CSV: \`${REVIEW_CSV}\`\n- Errores: ${errors.length ? errors.join(' | ') : 'sin errores'}`)
  console.log(`Flags FlagCDN listas. Descargadas: ${downloaded}. Subidas: ${uploaded}. Missing ISO: ${missing}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
