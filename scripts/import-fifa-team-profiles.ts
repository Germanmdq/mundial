import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getAdminSupabaseClient, getAnonSupabaseRows, loadEnvLocal, slugify, writeCsv, type CsvRow } from './api-import-utils'

const CACHE_DIR = 'supabase/import/api-cache/fifa-team-profiles'
const CSV_PATH = 'supabase/import/fifa_team_profiles_review.csv'
const DATA_PATH = 'src/data/fifa-team-profiles.ts'
const REPORT_PATH = 'supabase/reports/fifa_team_profiles_import_report.md'
const FIFA_ARTICLE_PREFIX = 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/'
const SITEMAP_PREFIX = 'https://cxm-api.fifa.com/fifaplusweb/api/sitemaps/articles/'

type TeamRow = {
  id: string | number
  name: string
  slug: string
  fifa_code?: string | null
}

type Profile = {
  teamSlug: string
  teamName: string
  displayNameEs: string
  fifaProfileUrl?: string
  publishedAt?: string
  coach?: string
  groupName?: string
  qualificationSummary?: string
  confederation?: string
  bestResult?: string
  bestResultYears?: string[]
  lastWorldCup?: string
  lastWorldCupResult?: string
  firstWorldCup?: string
  appearancesCount?: number
  appearancesYears?: string[]
  currentQualificationStreak?: string
  hostYears?: string[]
  record?: {
    played?: number
    wins?: number
    draws?: number
    losses?: number
    goalsFor?: number
    goalsAgainst?: number
  }
  topScorer?: {
    name?: string
    goals?: number
  }
  mostAppearances?: {
    name?: string
    matches?: number
  }
  biggestWin?: string
  iconicMomentsSummary?: string
  shortHistorySummary?: string
  status: 'imported' | 'missing_profile' | 'ambiguous' | 'extraction_partial' | 'error'
  notes?: string
}

const DISPLAY_ES: Record<string, string> = {
  argentina: 'Argentina',
  australia: 'Australia',
  austria: 'Austria',
  belgium: 'Belgica',
  'bosnia-and-herzegovina': 'Bosnia y Herzegovina',
  brazil: 'Brasil',
  canada: 'Canada',
  'cape-verde': 'Cabo Verde',
  colombia: 'Colombia',
  'congo-dr': 'RD Congo',
  croatia: 'Croacia',
  curacao: 'Curazao',
  czechia: 'Chequia',
  ecuador: 'Ecuador',
  egypt: 'Egipto',
  england: 'Inglaterra',
  france: 'Francia',
  germany: 'Alemania',
  ghana: 'Ghana',
  haiti: 'Haiti',
  iran: 'RI de Iran',
  iraq: 'Irak',
  'ivory-coast': 'Costa de Marfil',
  japan: 'Japon',
  jordan: 'Jordania',
  mexico: 'Mexico',
  morocco: 'Marruecos',
  netherlands: 'Paises Bajos',
  'new-zealand': 'Nueva Zelanda',
  norway: 'Noruega',
  panama: 'Panama',
  paraguay: 'Paraguay',
  portugal: 'Portugal',
  qatar: 'Catar',
  'saudi-arabia': 'Arabia Saudita',
  scotland: 'Escocia',
  senegal: 'Senegal',
  'south-africa': 'Sudafrica',
  'south-korea': 'Republica de Corea',
  spain: 'Espana',
  sweden: 'Suecia',
  switzerland: 'Suiza',
  tunisia: 'Tunez',
  turkey: 'Turquia',
  'united-states': 'Estados Unidos',
  uruguay: 'Uruguay',
  uzbekistan: 'Uzbekistan',
}

const CONFEDERATIONS: Record<string, string> = {
  argentina: 'CONMEBOL',
  australia: 'AFC',
  austria: 'UEFA',
  belgium: 'UEFA',
  'bosnia-and-herzegovina': 'UEFA',
  brazil: 'CONMEBOL',
  canada: 'CONCACAF',
  'cape-verde': 'CAF',
  colombia: 'CONMEBOL',
  'congo-dr': 'CAF',
  croatia: 'UEFA',
  curacao: 'CONCACAF',
  czechia: 'UEFA',
  ecuador: 'CONMEBOL',
  egypt: 'CAF',
  england: 'UEFA',
  france: 'UEFA',
  germany: 'UEFA',
  ghana: 'CAF',
  haiti: 'CONCACAF',
  iran: 'AFC',
  iraq: 'AFC',
  'ivory-coast': 'CAF',
  japan: 'AFC',
  jordan: 'AFC',
  mexico: 'CONCACAF',
  morocco: 'CAF',
  netherlands: 'UEFA',
  'new-zealand': 'OFC',
  norway: 'UEFA',
  panama: 'CONCACAF',
  paraguay: 'CONMEBOL',
  portugal: 'UEFA',
  qatar: 'AFC',
  'saudi-arabia': 'AFC',
  scotland: 'UEFA',
  senegal: 'CAF',
  'south-africa': 'CAF',
  'south-korea': 'AFC',
  spain: 'UEFA',
  sweden: 'UEFA',
  switzerland: 'UEFA',
  tunisia: 'CAF',
  turkey: 'UEFA',
  'united-states': 'CONCACAF',
  uruguay: 'CONMEBOL',
  uzbekistan: 'AFC',
}

const CONFIRMED_URLS: Record<string, string> = {
  belgium: `${FIFA_ARTICLE_PREFIX}belgica-historia-perfil-mundiales`,
  brazil: `${FIFA_ARTICLE_PREFIX}brasil-perfil-copa-mundial-historia-trayectoria`,
  canada: `${FIFA_ARTICLE_PREFIX}canada-en-la-copa-mundial-de-la-fifa-perfil-y-trayectoria-de-la-seleccion`,
  curacao: `${FIFA_ARTICLE_PREFIX}historia-curazao-copa-mundial`,
  ecuador: `${FIFA_ARTICLE_PREFIX}ecuador-en-la-copa-mundial-fifa-historia`,
  egypt: `${FIFA_ARTICLE_PREFIX}egypt-perfil-seleccion-trayectoria-historia`,
  ghana: `${FIFA_ARTICLE_PREFIX}ghana-perfil-seleccion-historia-records`,
  haiti: `${FIFA_ARTICLE_PREFIX}haiti-copa-mundial-historia-perfil-trayectoria`,
  iran: `${FIFA_ARTICLE_PREFIX}perfil-ri-de-iran-historia`,
  netherlands: `${FIFA_ARTICLE_PREFIX}paises-bajos-copa-mundial-historia-trayectoria-torneos`,
  'new-zealand': `${FIFA_ARTICLE_PREFIX}nueva-zelanda-seleccion-perfil-historia`,
  qatar: `${FIFA_ARTICLE_PREFIX}catar-perfil-seleccion-record-historia`,
  spain: `${FIFA_ARTICLE_PREFIX}espana-en-la-copa-mundial-de-la-fifa-historia-y-perfil-del-equipo`,
  tunisia: `${FIFA_ARTICLE_PREFIX}tunez-seleccion-perfil-equipo-historia`,
  'united-states': `${FIFA_ARTICLE_PREFIX}estados-unidos-perfil-historia-en-los-mundiales`,
}

const HISTORY_FALLBACK: Record<string, Partial<Profile>> = {
  canada: { appearancesCount: 3, firstWorldCup: '1986', lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', appearancesYears: ['1986', '2022', '2026'], shortHistorySummary: 'Canada llega como coanfitriona y encadena participaciones mundialistas tras su regreso en 2022.' },
  belgium: { appearancesCount: 15, lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Tercer puesto', bestResultYears: ['2018'], shortHistorySummary: 'Belgica vuelve con una historia de presencia frecuente y su techo mundialista en el tercer puesto de 2018.' },
  brazil: { appearancesCount: 23, lastWorldCup: '2022', lastWorldCupResult: 'Cuartos de final', bestResult: 'Campeon', bestResultYears: ['1958', '1962', '1970', '1994', '2002'], shortHistorySummary: 'Brasil mantiene la marca historica de haber disputado todas las Copas del Mundo y busca su sexto titulo.' },
  curacao: { appearancesCount: 1, firstWorldCup: '2026', bestResult: 'Debut mundialista', appearancesYears: ['2026'], shortHistorySummary: 'Curazao llega a su primera Copa Mundial tras una clasificacion historica en Concacaf.' },
  ecuador: { appearancesCount: 5, lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Octavos de final', bestResultYears: ['2006'], shortHistorySummary: 'Ecuador disputara su quinta Copa Mundial y busca superar su mejor antecedente de octavos de final.' },
  egypt: { appearancesCount: 4, firstWorldCup: '1934', lastWorldCup: '2018', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', shortHistorySummary: 'Egipto suma una nueva participacion mundialista tras una trayectoria historica iniciada en 1934.' },
  ghana: { appearancesCount: 5, lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Cuartos de final', bestResultYears: ['2010'], shortHistorySummary: 'Ghana vuelve con el antecedente de cuartos de final en 2010 como mejor actuacion historica.' },
  haiti: { appearancesCount: 2, firstWorldCup: '1974', lastWorldCup: '1974', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', appearancesYears: ['1974', '2026'], shortHistorySummary: 'Haiti regresa al Mundial despues de su primera participacion en 1974.' },
  iran: { appearancesCount: 7, lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', shortHistorySummary: 'La RI de Iran llega a su septima Copa Mundial con presencia sostenida en las ultimas ediciones.' },
  netherlands: { appearancesCount: 12, lastWorldCup: '2022', lastWorldCupResult: 'Cuartos de final', bestResult: 'Subcampeon', bestResultYears: ['1974', '1978', '2010'], shortHistorySummary: 'Paises Bajos carga con tres finales mundialistas y una tradicion de alto impacto en fases eliminatorias.' },
  'new-zealand': { appearancesCount: 3, firstWorldCup: '1982', lastWorldCup: '2010', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', appearancesYears: ['1982', '2010', '2026'], shortHistorySummary: 'Nueva Zelanda disputara su tercera Copa Mundial y vuelve tras sus antecedentes de 1982 y 2010.' },
  qatar: { appearancesCount: 2, firstWorldCup: '2022', lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', appearancesYears: ['2022', '2026'], shortHistorySummary: 'Catar afronta su segunda Copa Mundial, primera clasificacion lograda en cancha tras ser anfitrion en 2022.' },
  spain: { appearancesCount: 17, lastWorldCup: '2022', lastWorldCupResult: 'Octavos de final', bestResult: 'Campeon', bestResultYears: ['2010'], shortHistorySummary: 'Espana afronta otra Copa Mundial con el titulo de 2010 como hito mayor de su historia.' },
  tunisia: { appearancesCount: 7, firstWorldCup: '1978', lastWorldCup: '2022', lastWorldCupResult: 'Fase de grupos', bestResult: 'Fase de grupos', appearancesYears: ['1978', '1998', '2002', '2006', '2018', '2022', '2026'], shortHistorySummary: 'Tunez llega a su septima Copa Mundial buscando superar por primera vez la fase de grupos.' },
  'united-states': { appearancesCount: 12, firstWorldCup: '1930', lastWorldCup: '2022', lastWorldCupResult: 'Octavos de final', bestResult: 'Semifinales', bestResultYears: ['1930'], hostYears: ['1994', '2026'], shortHistorySummary: 'Estados Unidos sera coanfitrion y busca superar su reciente eliminacion en octavos de final de 2022.' },
}

function clean(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function htmlToText(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  ).trim()
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'mi-prediccion-fifa-profile-import/1.0' } })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

async function loadTeams(): Promise<TeamRow[]> {
  const rows = (await getAnonSupabaseRows('teams_info', 'id,name,slug,fifa_code')) as unknown as TeamRow[]
  if (rows.length > 0) return rows.filter((team) => team.slug).sort((a, b) => a.name.localeCompare(b.name))

  try {
    const cache = JSON.parse(await readFile('supabase/import/api-cache/wc2026api/teams.json', 'utf8')) as Array<Record<string, unknown>>
    return cache.map((team, index) => ({
      id: clean(team.id) || index + 1,
      name: clean(team.name),
      slug: slugify(clean(team.name)),
      fifa_code: clean(team.code),
    }))
  } catch {
    return []
  }
}

async function discoverFifaArticleUrls(): Promise<string[]> {
  const urls = new Set<string>(Object.values(CONFIRMED_URLS))
  for (let index = 0; index <= 70; index += 1) {
    const xml = await fetchText(`${SITEMAP_PREFIX}${index}`)
    if (!xml) continue
    for (const match of xml.matchAll(/<loc>(https:\/\/www\.fifa\.com\/es\/tournaments\/mens\/worldcup\/canadamexicousa2026\/articles\/[^<]+)<\/loc>/g)) {
      const url = decodeHtml(match[1])
      if (/perfil|historia|trayectoria|record|récord/i.test(url)) urls.add(url)
    }
  }
  return Array.from(urls)
}

function titleFromHtml(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
  return decodeHtml(og ?? title ?? '')
}

function extractPublishedAt(text: string): string | undefined {
  return text.match(/Publicado\s+(\d{1,2}\s+[a-zA-Záéíóúñ]+\s+\d{4})/i)?.[1]
}

function extractCoach(text: string): string | undefined {
  return text.match(/Seleccionador:?\s+([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{3,60})/)?.[1]?.trim()
}

function extractNumberAfter(text: string, label: RegExp): number | undefined {
  const match = text.match(label)
  if (!match?.[1]) return undefined
  const parsed = Number(match[1])
  return Number.isFinite(parsed) ? parsed : undefined
}

function extractYears(text: string): string[] {
  return Array.from(new Set(Array.from(text.matchAll(/\b(19[3-9]\d|20[0-2]\d)\b/g)).map((match) => match[1]))).slice(0, 30)
}

function compactSummary(text: string, teamName: string): string | undefined {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 60 && sentence.length < 260)
    .filter((sentence) => normalize(sentence).includes(normalize(teamName.split(' ')[0])) || /copa mundial|mundial/i.test(sentence))
    .slice(0, 2)
  if (sentences.length === 0) return undefined
  return sentences.join(' ').replace(/\s+/g, ' ').slice(0, 420)
}

function validateArticle(team: TeamRow, title: string, text: string, url: string): boolean {
  if (!url.startsWith(FIFA_ARTICLE_PREFIX)) return false
  const display = DISPLAY_ES[team.slug] ?? team.name
  const haystack = normalize(`${title} ${text.slice(0, 3500)}`)
  const aliases = [display, team.name, team.fifa_code ?? ''].map(normalize).filter(Boolean)
  return aliases.some((alias) => alias.length > 2 && haystack.includes(alias)) && /copa mundial|mundial|fifa/i.test(haystack)
}

function chooseCandidate(team: TeamRow, urls: string[]): string | null {
  if (CONFIRMED_URLS[team.slug]) return CONFIRMED_URLS[team.slug]
  const display = slugify(DISPLAY_ES[team.slug] ?? team.name)
  const nameSlug = slugify(team.name)
  const tokens = new Set([team.slug, display, nameSlug, ...team.slug.split('-'), ...display.split('-')].filter((token) => token.length > 3))
  const candidates = urls
    .map((url) => {
      const articleSlug = url.split('/articles/')[1] ?? url
      return { url, score: Array.from(tokens).reduce((sum, token) => sum + (articleSlug.includes(token) ? 1 : 0), 0) }
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
  return candidates[0]?.url ?? null
}

function extractProfile(team: TeamRow, url: string | null, html: string | null): Profile {
  const displayNameEs = DISPLAY_ES[team.slug] ?? team.name
  const fallback = HISTORY_FALLBACK[team.slug] ?? {}
  const hasConfirmedFallback = Boolean(CONFIRMED_URLS[team.slug] && Object.keys(fallback).length > 0)
  if (!url || !html) {
    return {
      teamSlug: team.slug,
      teamName: team.name,
      displayNameEs,
      confederation: CONFEDERATIONS[team.slug],
      status: 'missing_profile',
      notes: 'No se encontro perfil FIFA validado.',
    }
  }

  const text = htmlToText(html)
  const title = titleFromHtml(html)
  const valid = validateArticle(team, title, text, url)
  const appearancesCount =
    extractNumberAfter(text, /participaciones en (?:la )?Copa Mundial[^0-9]{0,40}(\d{1,2})/i) ??
    extractNumberAfter(text, /(\d{1,2})[a-zªº]*\s+(?:participacion|participación|edicion|edición)/i) ??
    fallback.appearancesCount
  const years = extractYears(text)
  const summary = compactSummary(text, displayNameEs) ?? fallback.shortHistorySummary

  return {
    teamSlug: team.slug,
    teamName: team.name,
    displayNameEs,
    fifaProfileUrl: url,
    publishedAt: extractPublishedAt(text),
    coach: extractCoach(text),
    groupName: text.match(/Grupo\s+([A-L])\b/i)?.[1],
    qualificationSummary: text.match(/Clasificaci[oó]n[^.]{20,220}\./i)?.[0],
    confederation: CONFEDERATIONS[team.slug],
    bestResult: fallback.bestResult ?? text.match(/mejor actuaci[oó]n[^.]{0,160}/i)?.[0],
    bestResultYears: fallback.bestResultYears ?? years.filter((year) => /1930|1950|1954|1958|1966|1974|1978|1986|1990|1994|1998|2002|2010|2014|2018|2022/.test(year)).slice(0, 8),
    lastWorldCup: fallback.lastWorldCup,
    lastWorldCupResult: fallback.lastWorldCupResult,
    firstWorldCup: fallback.firstWorldCup,
    appearancesCount,
    appearancesYears: fallback.appearancesYears ?? years,
    currentQualificationStreak: text.match(/racha[^.]{0,160}/i)?.[0],
    hostYears: fallback.hostYears,
    record: {
      played: extractNumberAfter(text, /partidos jugados[^0-9]{0,30}(\d{1,3})/i),
      wins: extractNumberAfter(text, /victorias[^0-9]{0,30}(\d{1,3})/i),
      draws: extractNumberAfter(text, /empates[^0-9]{0,30}(\d{1,3})/i),
      losses: extractNumberAfter(text, /derrotas[^0-9]{0,30}(\d{1,3})/i),
      goalsFor: extractNumberAfter(text, /goles a favor[^0-9]{0,30}(\d{1,3})/i),
      goalsAgainst: extractNumberAfter(text, /goles en contra[^0-9]{0,30}(\d{1,3})/i),
    },
    topScorer: {
      name: text.match(/m[aá]ximo goleador[^A-ZÁÉÍÓÚÑ]{0,80}([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{3,60})/)?.[1]?.trim(),
      goals: extractNumberAfter(text, /m[aá]ximo goleador[^0-9]{0,120}(\d{1,2})\s+goles/i),
    },
    mostAppearances: {
      name: text.match(/m[aá]s partidos[^A-ZÁÉÍÓÚÑ]{0,80}([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{3,60})/)?.[1]?.trim(),
      matches: extractNumberAfter(text, /m[aá]s partidos[^0-9]{0,120}(\d{1,2})/i),
    },
    biggestWin: text.match(/mayor goleada[^.]{0,180}/i)?.[0],
    iconicMomentsSummary: summary,
    shortHistorySummary: summary,
    status: !valid && !hasConfirmedFallback ? 'ambiguous' : summary && appearancesCount ? 'imported' : 'extraction_partial',
    notes:
      !valid && hasConfirmedFallback
        ? 'URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision.'
        : !valid
          ? `Candidato no validado por titulo/contenido. Title=${title}`
          : 'Perfil FIFA cacheado; revisar CSV antes de publicar como definitivo.',
  }
}

function profileToCsv(profile: Profile): CsvRow {
  return {
    team_slug: profile.teamSlug,
    team_name: profile.teamName,
    display_name_es: profile.displayNameEs,
    fifa_profile_url: profile.fifaProfileUrl ?? '',
    published_at: profile.publishedAt ?? '',
    coach: profile.coach ?? '',
    group_name: profile.groupName ?? '',
    qualification_summary: profile.qualificationSummary ?? '',
    confederation: profile.confederation ?? '',
    best_result: profile.bestResult ?? '',
    best_result_years: profile.bestResultYears?.join('|') ?? '',
    last_world_cup: profile.lastWorldCup ?? '',
    last_world_cup_result: profile.lastWorldCupResult ?? '',
    first_world_cup: profile.firstWorldCup ?? '',
    world_cup_appearances_count: profile.appearancesCount ? String(profile.appearancesCount) : '',
    world_cup_appearances_years: profile.appearancesYears?.join('|') ?? '',
    current_qualification_streak: profile.currentQualificationStreak ?? '',
    host_years: profile.hostYears?.join('|') ?? '',
    world_cup_record_played: profile.record?.played ? String(profile.record.played) : '',
    world_cup_record_wins: profile.record?.wins ? String(profile.record.wins) : '',
    world_cup_record_draws: profile.record?.draws ? String(profile.record.draws) : '',
    world_cup_record_losses: profile.record?.losses ? String(profile.record.losses) : '',
    world_cup_record_goals_for: profile.record?.goalsFor ? String(profile.record.goalsFor) : '',
    world_cup_record_goals_against: profile.record?.goalsAgainst ? String(profile.record.goalsAgainst) : '',
    top_world_cup_scorer: profile.topScorer?.name ?? '',
    top_world_cup_scorer_goals: profile.topScorer?.goals ? String(profile.topScorer.goals) : '',
    most_world_cup_appearances_player: profile.mostAppearances?.name ?? '',
    most_world_cup_appearances_count: profile.mostAppearances?.matches ? String(profile.mostAppearances.matches) : '',
    biggest_world_cup_win: profile.biggestWin ?? '',
    iconic_moments_summary: profile.iconicMomentsSummary ?? '',
    short_history_summary: profile.shortHistorySummary ?? '',
    status: profile.status,
    notes: profile.notes ?? '',
  }
}

async function writeDataFile(profiles: Profile[]) {
  const body = profiles
    .sort((a, b) => a.teamSlug.localeCompare(b.teamSlug))
    .map((profile) => `  ${JSON.stringify(profile.teamSlug)}: ${JSON.stringify(profile, null, 2).replace(/\n/g, '\n  ')},`)
    .join('\n')

  await mkdir(path.dirname(DATA_PATH), { recursive: true })
  await writeFile(
    DATA_PATH,
    `export type FifaTeamProfile = {
  teamSlug: string
  teamName: string
  displayNameEs: string
  fifaProfileUrl?: string
  publishedAt?: string
  coach?: string
  groupName?: string
  qualificationSummary?: string
  confederation?: string
  bestResult?: string
  bestResultYears?: string[]
  lastWorldCup?: string
  lastWorldCupResult?: string
  firstWorldCup?: string
  appearancesCount?: number
  appearancesYears?: string[]
  currentQualificationStreak?: string
  hostYears?: string[]
  record?: {
    played?: number
    wins?: number
    draws?: number
    losses?: number
    goalsFor?: number
    goalsAgainst?: number
  }
  topScorer?: {
    name?: string
    goals?: number
  }
  mostAppearances?: {
    name?: string
    matches?: number
  }
  biggestWin?: string
  iconicMomentsSummary?: string
  shortHistorySummary?: string
  status: 'imported' | 'missing_profile' | 'ambiguous' | 'extraction_partial' | 'error'
  notes?: string
}

export const FIFA_TEAM_PROFILES: Record<string, FifaTeamProfile> = {
${body}
}
`,
  )
}

async function main() {
  await loadEnvLocal()
  await mkdir(CACHE_DIR, { recursive: true })
  await mkdir('supabase/reports', { recursive: true })
  const teams = await loadTeams()
  const urls = await discoverFifaArticleUrls()
  const profiles: Profile[] = []

  for (const team of teams) {
    const candidate = chooseCandidate(team, urls)
    const html = candidate ? await fetchText(candidate) : null
    if (candidate && html) {
      await writeFile(path.join(CACHE_DIR, `${team.slug}.html`), html)
    }
    const profile = extractProfile(team, candidate, html)
    await writeFile(path.join(CACHE_DIR, `${team.slug}.json`), `${JSON.stringify(profile, null, 2)}\n`)
    profiles.push(profile)
  }

  const headers = [
    'team_slug',
    'team_name',
    'display_name_es',
    'fifa_profile_url',
    'published_at',
    'coach',
    'group_name',
    'qualification_summary',
    'confederation',
    'best_result',
    'best_result_years',
    'last_world_cup',
    'last_world_cup_result',
    'first_world_cup',
    'world_cup_appearances_count',
    'world_cup_appearances_years',
    'current_qualification_streak',
    'host_years',
    'world_cup_record_played',
    'world_cup_record_wins',
    'world_cup_record_draws',
    'world_cup_record_losses',
    'world_cup_record_goals_for',
    'world_cup_record_goals_against',
    'top_world_cup_scorer',
    'top_world_cup_scorer_goals',
    'most_world_cup_appearances_player',
    'most_world_cup_appearances_count',
    'biggest_world_cup_win',
    'iconic_moments_summary',
    'short_history_summary',
    'status',
    'notes',
  ]
  await writeCsv(CSV_PATH, headers, profiles.map(profileToCsv))
  await writeDataFile(profiles)

  const counts = profiles.reduce<Record<string, number>>((acc, profile) => {
    acc[profile.status] = (acc[profile.status] ?? 0) + 1
    return acc
  }, {})
  const imported = profiles.filter((profile) => profile.status === 'imported')
  const partial = profiles.filter((profile) => profile.status === 'extraction_partial')
  const missing = profiles.filter((profile) => profile.status === 'missing_profile')
  const ambiguous = profiles.filter((profile) => profile.status === 'ambiguous')
  const compatibleTables = ['team_profiles', 'team_history', 'team_worldcup_history']
  const admin = getAdminSupabaseClient()

  await writeFile(
    REPORT_PATH,
    `# FIFA team profiles import report

- Equipos procesados: ${profiles.length}
- URLs de sitemap/articulos candidatas: ${urls.length}
- Perfiles importados: ${counts.imported ?? 0}
- Perfiles missing: ${counts.missing_profile ?? 0}
- Perfiles ambiguous: ${counts.ambiguous ?? 0}
- Perfiles con extraccion parcial: ${counts.extraction_partial ?? 0}
- Service role detectada: ${admin ? 'si' : 'no'}
- Persistencia Supabase: no ejecutada; no se modifica schema automaticamente.
- Tablas compatibles esperadas si se quiere persistir luego: ${compatibleTables.map((table) => `\`${table}\``).join(', ')}

## Importados

${imported.length ? imported.map((profile) => `- ${profile.displayNameEs}: ${profile.fifaProfileUrl}`).join('\n') : '- Ninguno'}

## Extraccion parcial

${partial.length ? partial.map((profile) => `- ${profile.displayNameEs}: ${profile.fifaProfileUrl}`).join('\n') : '- Ninguno'}

## Ambiguous

${ambiguous.length ? ambiguous.map((profile) => `- ${profile.displayNameEs}: ${profile.fifaProfileUrl ?? 'sin url'} (${profile.notes ?? ''})`).join('\n') : '- Ninguno'}

## Missing

${missing.length ? missing.map((profile) => `- ${profile.displayNameEs}`).join('\n') : '- Ninguno'}

## Proximos pasos

- Revisar \`${CSV_PATH}\` antes de publicar textos como definitivos.
- Completar manualmente perfiles missing/ambiguous cuando FIFA publique o cambie slugs.
- No renderizar HTML cacheado; usar solo datos estructurados y resumen propio.
`,
  )

  console.log(`FIFA team profiles import listo. Procesados: ${profiles.length}. Importados: ${counts.imported ?? 0}. Parciales: ${counts.extraction_partial ?? 0}. Missing: ${counts.missing_profile ?? 0}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
