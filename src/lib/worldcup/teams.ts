import { createClient } from '@/lib/supabase/server'

export async function getTeams() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams_info')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }
  
  return data
}

export async function getTeamBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams_info')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error(`Error fetching team with slug ${slug}:`, error)
    return null
  }
  
  return data
}
