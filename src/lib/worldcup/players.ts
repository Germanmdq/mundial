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
const PAGE_SIZE = 1000

async function fetchPlayersPage(teamId?: string | number): Promise<PlayerRow[]> {
  const supabase = await createClient()
  const rows: PlayerRow[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1
    let query = supabase
      .from('players_info')
      .select(PLAYER_SELECT)
      .order('team_id')
      .order('position')
      .order('shirt_number')
      .order('name')
      .range(from, to)

    if (teamId !== undefined) {
      query = query.eq('team_id', teamId)
    }

    const { data, error } = await query

    if (error) {
      console.error(teamId === undefined ? 'Error fetching players:' : `Error fetching players for team ${teamId}:`, error)
      return []
    }

    rows.push(...((data ?? []) as PlayerRow[]))
    if (!data || data.length < PAGE_SIZE) break
  }

  return rows
}

export async function getPlayers(): Promise<Player[]> {
  const rows = await fetchPlayersPage()
  return rows.map(normalizePlayer).filter(isDisplayablePlayer)
}

export async function getPlayersByTeam(teamId: string | number): Promise<Player[]> {
  const rows = await fetchPlayersPage(teamId)
  return rows.map(normalizePlayer).filter(isDisplayablePlayer)
}
