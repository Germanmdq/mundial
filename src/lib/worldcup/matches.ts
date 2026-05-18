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
  phase?: string | null
  round?: string | null
  stage_name?: string | null
  phase_name?: string | null
  round_name?: string | null
  stage_label: string | null
  group_letter: string | null
  group_name?: string | null
  group_id?: string | number | null
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

const CURRENT_GROUP_STAGE_MATCHES = 72

function normalizeStageValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
}

function getMatchStageText(match: Match) {
  return [
    match.stage,
    match.phase,
    match.round,
    match.stage_name,
    match.phase_name,
    match.round_name,
    match.stage_label,
    match.group_name,
    match.group_id,
    match.group_letter,
  ]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(normalizeStageValue)
    .join(" ")
}

function sortMatches(matches: Match[]) {
  return [...matches].sort((a, b) => {
    const aNumber = a.match_number ?? Number.MAX_SAFE_INTEGER
    const bNumber = b.match_number ?? Number.MAX_SAFE_INTEGER
    if (aNumber !== bNumber) return aNumber - bNumber

    const aSort = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const bSort = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (aSort !== bSort) return aSort - bSort

    return String(a.kickoff_at ?? "").localeCompare(String(b.kickoff_at ?? ""))
  })
}

export function isGroupStageMatch(match: Match) {
  if (match.is_knockout === false) return true

  const raw = getMatchStageText(match)
  return (
    raw.includes("group")
    || raw.includes("grupo")
    || raw.includes("fase de grupos")
  )
}

/** Read matches enabled for the current prediction phase. Never writes. */
export async function getMatches(): Promise<Match[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_number', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[matches] Error fetching matches:', error)
    return []
  }

  const allMatches = sortMatches((data as Match[]) ?? [])
  const groupMatches = allMatches.filter(isGroupStageMatch)
  const selectedMatches = groupMatches.length > 0
    ? groupMatches.slice(0, CURRENT_GROUP_STAGE_MATCHES)
    : allMatches.slice(0, Math.min(CURRENT_GROUP_STAGE_MATCHES, allMatches.length))

  if (process.env.NODE_ENV !== "production") {
    console.info('[matches:getMatches]', {
      totalRaw: allMatches.length,
      groupFiltered: groupMatches.length,
      returned: selectedMatches.length,
      usedFallback: groupMatches.length === 0 && allMatches.length > 0,
      sampleStages: [...new Set(allMatches.slice(0, 12).map((match) => match.stage))],
    })
  }

  return selectedMatches
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
    .order('match_number', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(`[matches] Error fetching group ${groupLetter}:`, error)
    return []
  }

  return sortMatches(((data as Match[]) ?? []).filter((match) => (
    isGroupStageMatch(match)
    && String(match.group_letter ?? match.group_name ?? "").toUpperCase() === groupLetter.toUpperCase()
  )))
}

/** Read knockout stage matches. Never writes. */
export async function getKnockoutMatches(): Promise<Match[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_number', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[matches] Error fetching knockout matches:', error)
    return []
  }

  return sortMatches(((data as Match[]) ?? []).filter((match) => !isGroupStageMatch(match)))
}
