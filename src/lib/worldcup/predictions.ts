import { createClient } from '@/lib/supabase/server'

export async function getCurrentPredictionSession(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prediction_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
    console.error('Error fetching prediction session:', error)
    return null
  }
  
  return data
}

export async function createPredictionSession(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prediction_sessions')
    .insert({ user_id: userId, status: 'active' })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating prediction session:', error)
    return null
  }
  
  return data
}

export async function savePrediction(prediction: {
  match_id: string;
  user_id: string;
  home_goals: number;
  away_goals: number;
  session_id: string;
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('predictions')
    .upsert(prediction)
    .select()
    .single()
  
  if (error) {
    console.error('Error saving prediction:', error)
    return null
  }
  
  return data
}

export async function getUserPredictionDashboard(userId: string) {
  const supabase = await createClient()
  
  // Fetch current session, standing, and summary info
  const [session, standings] = await Promise.all([
    getCurrentPredictionSession(userId),
    supabase.from('user_group_standings').select('*').eq('user_id', userId)
  ])
  
  return {
    session,
    standings: standings.data || []
  }
}
