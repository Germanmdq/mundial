# Dominio visible en Google OAuth

Google muestra el dominio del proveedor que procesa el callback OAuth. Hoy ese proveedor es Supabase, por eso puede aparecer:

`djidlwumazwuwkedkbmu.supabase.co`

La app igual debe volver a:

`https://mundialentreamigos.online`

Para que Google muestre un dominio propio en vez de `supabase.co`, hay que configurar un custom domain de Supabase Auth.

## Pasos

1. En Supabase Dashboard, abrir Project Settings -> Custom Domains.
2. Crear un dominio para auth, por ejemplo:
   `auth.mundialentreamigos.online`
3. Configurar el DNS según indique Supabase.
4. En Google Cloud Console, abrir el OAuth Client y agregar en Authorized redirect URIs:
   `https://auth.mundialentreamigos.online/auth/v1/callback`
5. Mantener también el callback actual mientras se migra:
   `https://djidlwumazwuwkedkbmu.supabase.co/auth/v1/callback`
6. Si Supabase lo requiere para el cliente, actualizar `NEXT_PUBLIC_SUPABASE_URL` al custom domain.

## URLs de app

En Vercel:

`NEXT_PUBLIC_APP_URL=https://mundialentreamigos.online`

En Supabase Authentication -> URL Configuration:

Site URL:

`https://mundialentreamigos.online`

Redirect URLs:

`https://mundialentreamigos.online/**`
`https://www.mundialentreamigos.online/**`
`https://mundial-beryl.vercel.app/**`
`http://localhost:3000/**`
`http://localhost:3001/**`

Eliminar si aparece:

`https://sabiduria.online/**`

Mientras no exista Supabase Custom Domain, Google puede seguir mostrando `supabase.co` aunque la app vuelva correctamente a `mundialentreamigos.online`.
