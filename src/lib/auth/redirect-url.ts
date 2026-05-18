export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')

  return 'https://www.mundialentreamigos.online'
}

export function getBrowserAppUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')

  return 'https://www.mundialentreamigos.online'
}

export function getAuthCallbackUrl(next = '/mi-prediccion'): string {
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/mi-prediccion'
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/\/$/, '')
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.mundialentreamigos.online').replace(/\/$/, '')

  return `${baseUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`
}
