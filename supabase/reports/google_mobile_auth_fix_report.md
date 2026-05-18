# Google Mobile Auth Fix Report

## Cambio aplicado

- `redirectTo` de Google OAuth ahora se calcula con `window.location.origin` cuando se ejecuta en navegador.
- Si el usuario navega en `https://www.mundialentreamigos.online`, el callback queda en `https://www.mundialentreamigos.online/auth/callback?...`.
- Si el usuario navega sin `www`, el callback conserva ese mismo origen.
- `/auth/callback` redirige usando el `origin` real del request recibido, no `NEXT_PUBLIC_APP_URL`.
- El login muestra errores visibles si Google OAuth no puede iniciarse.
- `?debugAuth=1` muestra datos seguros: origin, callback calculado, `NEXT_PUBLIC_APP_URL` pública y user agent.

## Supabase Dashboard

Revisar en:

Authentication -> URL Configuration

Site URL:

```text
https://www.mundialentreamigos.online
```

Redirect URLs permitidas:

```text
https://www.mundialentreamigos.online/auth/callback
https://www.mundialentreamigos.online/**
https://mundialentreamigos.online/auth/callback
https://mundialentreamigos.online/**
http://localhost:3005/auth/callback
http://localhost:3005/**
```

## Google Cloud OAuth

Revisar en el OAuth Client:

Authorized JavaScript origins:

```text
https://www.mundialentreamigos.online
https://mundialentreamigos.online
```

Authorized redirect URIs:

Usar el callback del proveedor Google que muestra Supabase Auth Providers -> Google. Normalmente tiene esta forma:

```text
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

No inventar el project ref: copiarlo desde Supabase.

## Dominio canónico

Recomendación operativa:

- Usar `https://www.mundialentreamigos.online` como dominio público.
- Configurar en Vercel un redirect global no-www -> www, o elegir el inverso.
- No forzar ese cambio dentro del callback OAuth: durante OAuth se conserva el origin real para evitar cortes en Chrome mobile.

## Validación sugerida

Abrir:

```text
https://www.mundialentreamigos.online/login?debugAuth=1
```

Validar en Chrome desktop, Chrome mobile y Safari mobile:

- `origin = https://www.mundialentreamigos.online`
- `callbackUrl = https://www.mundialentreamigos.online/auth/callback?next=...`
- Google vuelve al mismo dominio.
