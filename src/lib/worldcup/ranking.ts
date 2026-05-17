import { createClient } from '@/lib/supabase/server'

export type LeaderboardEntry = {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  total_points: number
  rank: number
  previous_rank: number | null
  trend: 'up' | 'down' | 'same' | null
  type: string
}

export async function getLeaderboard(type: 'global' | 'group' = 'global'): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('type', type)
    .order('rank')
    
  if (error) {
    console.warn(`[ranking] Error fetching leaderboard for ${type}:`, error.message)
    return []
  }
  
  return (data as LeaderboardEntry[]) || []
}

export async function getUserRanking(userId: string): Promise<LeaderboardEntry | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'global')
    .single()
    
  if (error && error.code !== 'PGRST116') {
    console.warn(`[ranking] Error fetching ranking for user ${userId}:`, error.message)
    return null
  }
  
  return (data as LeaderboardEntry) || null
}
