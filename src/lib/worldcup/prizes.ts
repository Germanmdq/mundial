import { createClient } from '@/lib/supabase/server'

export type PrizePack = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  image_url: string | null
  image_alt: string | null
  sort_order: number
  is_active: boolean
  disclaimer: string | null
}

export async function getPrizePacks(): Promise<PrizePack[]> {
  const supabase = await createClient()
  
  // Try to fetch from prize_packs if it exists
  const { data, error } = await supabase
    .from('prize_packs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    
  if (error) {
    console.warn('[prizes] prize_packs table might not exist yet or error:', error.message)
    return []
  }
  
  return (data as PrizePack[]) || []
}

export async function getGoldenMatches() {
  const supabase = await createClient()
  
  // Try to fetch golden matches
  // Using a fallback approach where we check if a column exists or just filter by some criteria
  // If the schema isn't fully ready, we return an empty array
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_team_info:teams_info!home_team_id(*), away_team_info:teams_info!away_team_id(*)')
    .eq('is_golden_match', true)
    .order('kickoff_at')
    
  if (error) {
    console.warn('[prizes] Error fetching golden matches:', error.message)
    return []
  }
  
  return data || []
}
