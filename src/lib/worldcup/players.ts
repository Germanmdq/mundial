import { createClient } from '@/lib/supabase/server'
import { isDisplayablePlayer } from './player-validation'

export type Player = {
  id: number | string
  team_id: number | string | null
  name: string
  slug: string | null
  display_name: string | null
  position: string | null
  shirt_number: number | string | null
  club: string | null
  nationality?: string | null
  source_url?: string | null
  notes?: string | null
  status: string | null
  photo_url: string | null
  photo_storage_path: string | null
}

type PlayerRow = Record<string, unknown>

function normalizeText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function normalizePlayer(row: PlayerRow): Player {
  return {
    id: row.id as number | string,
    team_id: (row.team_id as number | string | null) ?? null,
    name: normalizeText(row.display_name) ?? normalizeText(row.name) ?? 'Jugador sin nombre',
    slug: normalizeText(row.slug),
    display_name: normalizeText(row.display_name),
    position: normalizeText(row.position),
    shirt_number: (row.shirt_number as number | string | null) ?? null,
    club: normalizeText(row.club),
    nationality: normalizeText(row.nationality),
    source_url: normalizeText(row.source_url),
    notes: normalizeText(row.notes),
    status: normalizeText(row.status) ?? 'pending_review',
    photo_url: normalizeText(row.photo_url),
    photo_storage_path: normalizeText(row.photo_storage_path),
  }
}

const PLAYER_SELECT = 'id, team_id, name, slug, display_name, position, shirt_number, club, nationality, source_url, status, photo_url, photo_storage_path'

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players_info')
    .select(PLAYER_SELECT)
    .order('team_id')
    .order('position')
    .order('shirt_number')
    .order('name')

  if (error) {
    console.error('Error fetching players:', error)
    return []
  }

  return ((data ?? []) as PlayerRow[]).map(normalizePlayer).filter(isDisplayablePlayer)
}

export async function getPlayersByTeam(teamId: string | number): Promise<Player[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players_info')
    .select(PLAYER_SELECT)
    .eq('team_id', teamId)
    .order('position')
    .order('shirt_number')
    .order('name')

  if (error) {
    console.error(`Error fetching players for team ${teamId}:`, error)
    return []
  }

  return ((data ?? []) as PlayerRow[]).map(normalizePlayer).filter(isDisplayablePlayer)
}
