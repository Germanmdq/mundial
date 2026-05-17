import { createClient } from '@supabase/supabase-js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Team = {
  id: number | string
  name: string
  slug: string | null
  fifa_code: string | null
  short_name?: string | null
  group_letter?: string | null
}

type Player = {
  id: number | string
  team_id: number | string | null
  name: string | null
  slug: string | null
  display_name: string | null
  shirt_number: number | string | null
  position: string | null
  club: string | null
}

const LOCAL_ROOT = 'assets/worldcup-assets'
const PUBLIC_ROOT = 'public/worldcup-assets'
const REPORT_PATH = 'supabase/reports/generated_placeholder_assets_report.md'

async function loadEnvLocal() {
  try {
    const env = await readFile('.env.local', 'utf8')
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
    }
  } catch {
    // Optional in CI.
  }
}

function escapeXml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function playerAssetSlug(player: Player): string {
  return player.slug || `${slugify(player.display_name || player.name || 'player') || 'player'}-${player.id}`
}

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function palette(seed: string) {
  const hash = hashString(seed)
  const hueA = hash % 360
  const hueB = (hueA + 42 + (hash % 58)) % 360
  const hueC = (hueA + 170) % 360
  return {
    dark: `hsl(${hueA} 46% 13%)`,
    mid: `hsl(${hueB} 58% 34%)`,
    bright: `hsl(${hueC} 72% 58%)`,
    soft: `hsl(${hueB} 44% 86%)`,
  }
}

function teamCode(team: Team): string {
  return (team.fifa_code || team.name.slice(0, 3)).toUpperCase()
}

function shortName(team: Team): string {
  return (team.short_name || team.name).slice(0, 18)
}

function flagSvg(team: Team): string {
  const colors = palette(team.slug || team.name)
  const code = teamCode(team)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" role="img" aria-label="Bandera temporal ${escapeXml(team.name)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.dark}"/>
      <stop offset="0.55" stop-color="${colors.mid}"/>
      <stop offset="1" stop-color="${colors.bright}"/>
    </linearGradient>
    <pattern id="p" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
      <rect width="34" height="34" fill="transparent"/>
      <path d="M0 17H34" stroke="white" stroke-opacity=".10" stroke-width="4"/>
    </pattern>
  </defs>
  <rect width="640" height="420" rx="48" fill="url(#g)"/>
  <rect width="640" height="420" rx="48" fill="url(#p)"/>
  <circle cx="498" cy="96" r="150" fill="white" opacity=".08"/>
  <rect x="58" y="58" width="524" height="304" rx="38" fill="none" stroke="white" stroke-opacity=".32" stroke-width="6"/>
  <text x="320" y="235" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="118" font-weight="900" letter-spacing="14" fill="white">${escapeXml(code)}</text>
</svg>`
}

function crestSvg(team: Team): string {
  const colors = palette(team.slug || team.name)
  const code = teamCode(team)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="880" viewBox="0 0 720 880" role="img" aria-label="Escudo temporal ${escapeXml(team.name)}">
  <defs>
    <linearGradient id="shield" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.dark}"/>
      <stop offset=".55" stop-color="${colors.mid}"/>
      <stop offset="1" stop-color="#10131d"/>
    </linearGradient>
    <radialGradient id="shine" cx=".35" cy=".18" r=".8">
      <stop offset="0" stop-color="white" stop-opacity=".24"/>
      <stop offset=".55" stop-color="white" stop-opacity=".05"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path d="M360 38 640 142v244c0 192-117 341-280 454C197 727 80 578 80 386V142L360 38Z" fill="url(#shield)" stroke="white" stroke-opacity=".38" stroke-width="14"/>
  <path d="M360 74 604 165v215c0 165-96 295-244 399C212 675 116 545 116 380V165L360 74Z" fill="url(#shine)"/>
  <path d="M174 266h372" stroke="white" stroke-opacity=".20" stroke-width="8" stroke-linecap="round"/>
  <path d="M220 640c68-40 212-40 280 0" fill="none" stroke="${colors.bright}" stroke-opacity=".9" stroke-width="18" stroke-linecap="round"/>
  <circle cx="360" cy="548" r="42" fill="none" stroke="white" stroke-opacity=".42" stroke-width="8"/>
  <text x="360" y="446" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="142" font-weight="950" letter-spacing="12" fill="white">${escapeXml(code)}</text>
  <text x="360" y="514" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="3" fill="${colors.soft}">${escapeXml(shortName(team).toUpperCase())}</text>
</svg>`
}

function stageSvg(team: Team, kind: 'hero' | 'background'): string {
  const colors = palette(`${team.slug || team.name}-${kind}`)
  const code = teamCode(team)
  const opacity = kind === 'hero' ? '.18' : '.11'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${kind} temporal ${escapeXml(team.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.dark}"/>
      <stop offset=".5" stop-color="${colors.mid}"/>
      <stop offset="1" stop-color="#060811"/>
    </linearGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0H0v80" fill="none" stroke="white" stroke-opacity=".06" stroke-width="2"/>
      <circle cx="0" cy="0" r="3" fill="white" opacity=".10"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <circle cx="1280" cy="120" r="360" fill="${colors.bright}" opacity=".14"/>
  <circle cx="230" cy="780" r="320" fill="white" opacity=".07"/>
  <path d="M120 650C380 510 640 825 900 665s420-205 590-110" fill="none" stroke="white" stroke-opacity=".14" stroke-width="22" stroke-linecap="round"/>
  <text x="116" y="328" font-family="Inter, Arial, sans-serif" font-size="240" font-weight="950" letter-spacing="18" fill="white" opacity="${opacity}">${escapeXml(code)}</text>
  <text x="124" y="420" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="850" letter-spacing="4" fill="white">${escapeXml(team.name)}</text>
  <text x="128" y="480" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="6" fill="${colors.soft}">GRUPO ${escapeXml(team.group_letter || '-')}</text>
</svg>`
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

function playerSvg(player: Player, team: Team): string {
  const name = player.display_name || player.name || 'Jugador'
  const colors = palette(`${team.slug}-${name}-${player.id}`)
  const number = player.shirt_number ? `#${player.shirt_number}` : teamCode(team)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" role="img" aria-label="Avatar temporal ${escapeXml(name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.dark}"/>
      <stop offset=".58" stop-color="${colors.mid}"/>
      <stop offset="1" stop-color="#090b12"/>
    </linearGradient>
    <radialGradient id="spot" cx=".36" cy=".18" r=".8">
      <stop offset="0" stop-color="white" stop-opacity=".24"/>
      <stop offset=".65" stop-color="white" stop-opacity=".04"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="640" height="640" rx="150" fill="url(#bg)"/>
  <rect width="640" height="640" rx="150" fill="url(#spot)"/>
  <circle cx="320" cy="248" r="96" fill="white" opacity=".18"/>
  <path d="M168 570c18-130 106-195 152-195s134 65 152 195" fill="white" opacity=".15"/>
  <path d="M112 120h416" stroke="white" stroke-opacity=".12" stroke-width="8" stroke-linecap="round"/>
  <text x="320" y="292" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="118" font-weight="950" letter-spacing="8" fill="white">${escapeXml(initials(name))}</text>
  <text x="320" y="424" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="900" fill="${colors.soft}">${escapeXml(number)}</text>
  <text x="320" y="482" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="2" fill="white" opacity=".86">${escapeXml(team.name.toUpperCase())}</text>
</svg>`
}

async function writeBoth(relativePath: string, content: string) {
  const localPath = path.join(LOCAL_ROOT, relativePath)
  const publicPath = path.join(PUBLIC_ROOT, relativePath)
  await mkdir(path.dirname(localPath), { recursive: true })
  await mkdir(path.dirname(publicPath), { recursive: true })
  await Promise.all([writeFile(localPath, content), writeFile(publicPath, content)])
}

async function main() {
  await loadEnvLocal()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  const [{ data: teams, error: teamsError }, { data: players, error: playersError }] = await Promise.all([
    supabase.from('teams_info').select('id, name, slug, fifa_code, short_name, group_letter').order('name'),
    supabase.from('players_info').select('id, team_id, name, slug, display_name, shirt_number, position, club').order('team_id'),
  ])

  if (teamsError) throw teamsError
  if (playersError) throw playersError

  const teamRows = ((teams ?? []) as Team[]).filter((team) => team.slug)
  const playerRows = (players ?? []) as Player[]
  const teamsById = new Map(teamRows.map((team) => [String(team.id), team]))

  let flags = 0
  let crests = 0
  let heroes = 0
  let backgrounds = 0
  let playerAvatars = 0

  for (const team of teamRows) {
    const slug = team.slug as string
    await writeBoth(`teams/${slug}/flag.svg`, flagSvg(team))
    await writeBoth(`teams/${slug}/crest.svg`, crestSvg(team))
    await writeBoth(`teams/${slug}/hero.svg`, stageSvg(team, 'hero'))
    await writeBoth(`teams/${slug}/background.svg`, stageSvg(team, 'background'))
    flags += 1
    crests += 1
    heroes += 1
    backgrounds += 1
  }

  const skippedPlayers: string[] = []
  for (const player of playerRows) {
    const team = teamsById.get(String(player.team_id))
    if (!team?.slug) {
      skippedPlayers.push(`${player.name || player.id}: equipo no encontrado`)
      continue
    }

    const slug = playerAssetSlug(player)
    await writeBoth(`players/${team.slug}/${slug}.svg`, playerSvg(player, team))
    playerAvatars += 1
  }

  const publicFiles = flags + crests + heroes + backgrounds + playerAvatars
  const report = [
    '# Assets temporales generados',
    '',
    `Fecha: ${new Date().toISOString()}`,
    '',
    `- Equipos procesados: ${teamRows.length}`,
    `- Escudos temporales creados: ${crests}`,
    `- Flags temporales creadas: ${flags}`,
    `- Heroes temporales creados: ${heroes}`,
    `- Backgrounds temporales creados: ${backgrounds}`,
    `- Jugadores procesados: ${playerRows.length}`,
    `- Avatares temporales creados: ${playerAvatars}`,
    `- Archivos publicos generados: ${publicFiles}`,
    `- Jugadores omitidos: ${skippedPlayers.length}`,
    '',
    '## Validacion',
    '',
    '- lint: pendiente',
    '- tsc: pendiente',
    '- build: pendiente',
    '',
    '## Omitidos',
    '',
    ...(skippedPlayers.length ? skippedPlayers.map((item) => `- ${item}`) : ['- Ninguno.']),
    '',
  ].join('\n')

  await mkdir(path.dirname(REPORT_PATH), { recursive: true })
  await writeFile(REPORT_PATH, report)
  console.log(`Placeholders listos. Reporte: ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
