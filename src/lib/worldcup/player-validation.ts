type PlayerValidationLike = {
  name?: string | null
  position?: string | null
  club?: string | null
  source_url?: string | null
  notes?: string | null
  status?: string | null
}

const TRUSTED_SOURCE_PATTERN = /(wikipedia|wikidata|wikimedia|fifa\.com|thesportsdb|wc2026|api-sports|api-football|football-data)/i
const OCR_SOURCE_PATTERN = /(ocr|panini|pdf|placeholder)/i
const KNOWN_BOGUS_NAME_PATTERN =
  /\b(arnt|wtor|dibba|eee|mks|pogon|rahm|tesielh|eat zidane|lot|por confirmar|ocr)\b/i
const WIKIPEDIA_SECTION_NAMES = [
  'Bids',
  'Broadcasters',
  'Broadcasting',
  'Final draw',
  'Finals',
  'General information',
  'Miscellaneous',
  'Official symbols',
  'Officials',
  'Qualification',
  'Squads',
  'Stages',
  'Team appearances',
  'Tournaments',
  'Awards',
  'Marketing',
  'Sponsorship',
  'Venues',
  'Host selection',
  'Draw',
  'Format',
  'Schedule',
  'Prize money',
  'Statistics',
  'Discipline',
  'Controversies',
]
const WIKIPEDIA_SECTION_PATTERN = new RegExp(
  `\\b(${WIKIPEDIA_SECTION_NAMES.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'i',
)
const ARTICLE_METADATA_PATTERN =
  /(19[3-9]\d|20[0-3]\d).*(19[3-9]\d|20[0-3]\d)|\b(AFC|CAF|CONCACAF|CONMEBOL|OFC|UEFA)\b|Group stage|Group [A-L]|Qualification|World Cup|Broadcasting|Awards|Controversies|Stadiums|Task force|Mascots|Official Album/i

function clean(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function normalize(value: string | null | undefined): string {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function hasTrustedSource(player: PlayerValidationLike): boolean {
  return TRUSTED_SOURCE_PATTERN.test(clean(player.source_url))
}

function hasOcrMarkers(player: PlayerValidationLike): boolean {
  return [player.position, player.club, player.notes, player.source_url].some((value) => OCR_SOURCE_PATTERN.test(clean(value)))
}

function hasHumanNameShape(name: string): boolean {
  const words = name
    .replace(/[.'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length < 2 || words.length > 5) return false
  return words.every((word) => /^[A-Za-zÀ-ÿ]{2,}$/.test(word))
}

export function isLikelyBogusPlayer(player: PlayerValidationLike): boolean {
  const name = clean(player.name)
  const normalizedName = normalize(name)

  if (normalize(player.status) === 'bogus_ocr') return true
  if (hasOcrMarkers(player)) return true
  if (!name || normalizedName.replace(/[^a-z]/g, '').length < 3) return true
  if (KNOWN_BOGUS_NAME_PATTERN.test(normalizedName)) return true

  const sourceUrl = clean(player.source_url)
  const position = clean(player.position)
  const club = clean(player.club)
  if (!hasTrustedSource(player) && !sourceUrl && /por confirmar/i.test(`${position} ${club}`)) return true

  if (/^[A-Z0-9\s]{2,}$/.test(name) && !hasHumanNameShape(name)) return true

  return false
}

export function isLikelyWikipediaSectionPlayer(player: PlayerValidationLike): boolean {
  const name = clean(player.name)
  const normalizedName = normalize(name)
  const position = clean(player.position)
  const club = clean(player.club)
  const sourceUrl = clean(player.source_url)
  const sectionName = WIKIPEDIA_SECTION_NAMES.some((section) => normalize(section) === normalizedName)

  if (sectionName) return true
  if (WIKIPEDIA_SECTION_PATTERN.test(name) && !hasHumanNameShape(name)) return true
  if (/por confirmar|posici[oó]n por confirmar/i.test(position) && ARTICLE_METADATA_PATTERN.test(club)) return true
  if (/wikipedia\.org\/wiki\/2026_FIFA_World_Cup_squads/i.test(sourceUrl) && ARTICLE_METADATA_PATTERN.test(`${name} ${club}`) && !hasHumanNameShape(name)) return true

  return false
}

export function isDisplayablePlayer(player: PlayerValidationLike): boolean {
  return !isLikelyBogusPlayer(player) && !isLikelyWikipediaSectionPlayer(player)
}
