import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/cuenta'
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/$/, '')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${appUrl}${next}`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${appUrl}/login?error=auth-callback`)
}
