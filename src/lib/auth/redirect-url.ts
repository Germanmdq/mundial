export function getAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')

  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }

  return 'http://localhost:3000'
}

export function getAuthCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`
}
