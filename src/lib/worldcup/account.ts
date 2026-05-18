import { createClient } from '@/lib/supabase/server'
import { getOfficialPredictionSummary } from '@/lib/server/predictions'

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

  const summary = await getOfficialPredictionSummary(userId).catch((error) => {
    console.warn(`[account] Error loading official prediction summary for user ${userId}:`, error.message)
    return { completedMatches: 0 }
  })
  
  return {
    session: session || null,
    ranking: ranking || null,
    completedMatchesCount: summary.completedMatches || 0
  }
}
