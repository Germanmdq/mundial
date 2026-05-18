/**
 * matches.ts — READ-ONLY access to the matches master table.
 *
 * RULES (do not violate):
 *  - This file NEVER writes to: matches, teams_info, players_info, team_assets,
 *    contest_settings, or match_prizes.
 *  - All mutations to master tables are handled by backend migrations
 *    (supabase/sql/) executed with service_role, never from the frontend.
 *  - The anon key used here is strictly SELECT-only for these tables.
 */

import { createClient } from '@/lib/supabase/server'

export type Match = {
  id: number
  match_number: number | null
  stage: string
  stage_label: string | null
  group_letter: string | null
  home_team: string | null
  away_team: string | null
  home_team_id: number | null
  away_team_id: number | null
  home_placeholder: string | null
  away_placeholder: string | null
  home_origin_label: string | null
  away_origin_label: string | null
  stadium_name: string | null
  city: string | null
  country: string | null
  kickoff_at: string | null
  is_knockout: boolean | null
  sort_order: number | null
}

/** Read matches enabled for the current prediction phase. Never writes. */
export async function getMatches(): Promise<Match[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('stage', 'GROUP')
    .order('match_number', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[matches] Error fetching matches:', error)
    return []
  }

  return (data as Match[]) ?? []
}

/** Read a single match by its database id. Never writes. */
export async function getMatchById(id: number): Promise<Match | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`[matches] Error fetching match id=${id}:`, error)
    return null
  }

  return data as Match
}

/** Read all group-stage matches for a given group letter. Never writes. */
export async function getGroupMatches(groupLetter: string): Promise<Match[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('stage', 'GROUP')
    .eq('group_letter', groupLetter.toUpperCase())
    .order('match_number', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(`[matches] Error fetching group ${groupLetter}:`, error)
    return []
  }

  return (data as Match[]) ?? []
}

/** Read knockout stage matches. Never writes. */
export async function getKnockoutMatches(): Promise<Match[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .neq('stage', 'GROUP')
    .order('match_number', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[matches] Error fetching knockout matches:', error)
    return []
  }

  return (data as Match[]) ?? []
}
