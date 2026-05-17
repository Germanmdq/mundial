export function getAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')

  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '')
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return origin
  }

  return 'https://mundialentreamigos.online'
}

export function getAuthCallbackUrl(next = '/mi-prediccion'): string {
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/mi-prediccion'
  return `${getAppUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`
}
