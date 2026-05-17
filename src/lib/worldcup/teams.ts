import { createClient } from '@/lib/supabase/server'
import type { TeamAssetLike } from '@/lib/worldcup/assets'

export type TeamAsset = TeamAssetLike & {
  id?: number | string
  team_id?: number | string | null
}

export type Team = {
  id: number | string
  name: string
  slug: string | null
  short_name?: string | null
  official_name?: string | null
  fifa_code: string | null
  group_name: string | null
  group_letter: string | null
  status?: string | null
  flag_url?: string | null
  crest_url?: string | null
  hero_image_url?: string | null
  team_assets: TeamAsset[]
}

type TeamRow = Record<string, unknown>

type TeamAssetRow = TeamAsset & {
  team_id?: number | string | null
}

function normalizeText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function normalizeTeam(row: TeamRow, assets: TeamAssetRow[]): Team {
  const id = row.id as number | string

  return {
    id,
    name: normalizeText(row.name) ?? 'Selección sin nombre',
    slug: normalizeText(row.slug),
    short_name: normalizeText(row.short_name),
    official_name: normalizeText(row.official_name),
    fifa_code: normalizeText(row.fifa_code),
    group_name: normalizeText(row.group_name),
    group_letter: normalizeText(row.group_letter),
    status: normalizeText(row.status),
    flag_url: normalizeText(row.flag_url),
    crest_url: normalizeText(row.crest_url),
    hero_image_url: normalizeText(row.hero_image_url),
    team_assets: assets.filter((asset) => String(asset.team_id) === String(id)),
  }
}

async function fetchTeamAssets(): Promise<TeamAssetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_assets')
    .select('id, team_id, asset_type, url, storage_path, is_primary')

  if (error) {
    console.error('Error fetching team assets:', error)
    return []
  }

  return (data ?? []) as TeamAssetRow[]
}

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient()
  const [{ data, error }, assets] = await Promise.all([
    supabase.from('teams_info').select('*').order('group_letter').order('name'),
    fetchTeamAssets(),
  ])

  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }

  return ((data ?? []) as TeamRow[]).map((row) => normalizeTeam(row, assets))
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const supabase = await createClient()
  const [{ data, error }, assets] = await Promise.all([
    supabase.from('teams_info').select('*').eq('slug', slug).single(),
    fetchTeamAssets(),
  ])

  if (error) {
    console.error(`Error fetching team with slug ${slug}:`, error)
    return null
  }

  return normalizeTeam(data as TeamRow, assets)
}
