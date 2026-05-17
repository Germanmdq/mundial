import { createClient } from '@/lib/supabase/server'

export async function getPlayers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players_info')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching players:', error)
    return []
  }
  
  return data
}

export async function getPlayersByTeam(teamId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players_info')
    .select('*')
    .eq('team_id', teamId)
    .order('name')
  
  if (error) {
    console.error(`Error fetching players for team ${teamId}:`, error)
    return []
  }
  
  return data
}
