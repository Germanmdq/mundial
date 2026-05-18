import { createClient } from '@/lib/supabase/server'

export async function getAccountDashboard(userId: string) {
  const supabase = await createClient()
  
  // 1. Fetch current prediction session
  const { data: session, error: sessionError } = await supabase
    .from('prediction_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
    
  if (sessionError && sessionError.code !== 'PGRST116') {
    console.warn(`[account] Error fetching session for user ${userId}:`, sessionError.message)
  }
  
  // 2. Fetch ranking
  const { data: ranking, error: rankingError } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'global')
    .single()
    
  if (rankingError && rankingError.code !== 'PGRST116') {
    console.warn(`[account] Error fetching ranking for user ${userId}:`, rankingError.message)
  }

  // 3. Fetch official predictions count from prediction_match_scores table
  const { count: completedMatchesCount, error: countError } = await supabase
    .from('prediction_match_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.warn(`[account] Error counting prediction scores for user ${userId}:`, countError.message)
  }
  
  return {
    session: session || null,
    ranking: ranking || null,
    completedMatchesCount: completedMatchesCount || 0
  }
}
