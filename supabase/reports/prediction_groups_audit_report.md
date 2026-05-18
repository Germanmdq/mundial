# Prediction groups audit report

## Fecha

2026-05-17

## Commit auditado

El `HEAD` actual al iniciar esta auditoria era:

- `fd8fa54 Fix official prediction saving and private groups backend`

El commit solicitado, inmediatamente anterior, es:

- `cc52236 Connect prediction flow and private groups UI`

## Archivos del ultimo commit HEAD

`fd8fa54` incluye solo:

- `src/lib/server/predictions.ts`
- `supabase/reports/prediction_save_and_groups_backend_report.md`

No hay indicios de `git add -A` indiscriminado en `HEAD`.

## Archivos del commit cc52236

`cc52236` incluye backend/server logic y una integracion minima de UI:

- `src/app/actions/groups.ts`
- `src/app/actions/predictions.ts`
- `src/app/api/payments/status/route.ts`
- `src/app/api/predictions/me/route.ts`
- `src/app/api/predictions/save-match/route.ts`
- `src/app/api/predictions/sync-draft/route.ts`
- `src/app/api/private-groups/create/route.ts`
- `src/app/api/private-groups/mine/route.ts`
- `src/app/grupos/page.tsx`
- `src/components/account/AccountDashboardClient.tsx`
- `src/components/groups/GroupsPanel.tsx`
- `src/components/prediction/PredictionForm.tsx`
- `src/lib/server/payments.ts`
- `src/lib/server/predictions.ts`
- `src/lib/server/private-groups.ts`
- `src/lib/worldcup/account.ts`
- `supabase/migrations/011_prediction_save_and_private_groups_runtime.sql`

No aparecen Home, hero, pagos, importadores, `.env.local` ni archivos WC2026. Si bien hay archivos de UI, estan vinculados a prediccion/cuenta/grupos y no parecen agregados ajenos por `git add -A`.

## Endpoints revisados

### `GET /api/payments/status`

Estado:

- Requiere usuario autenticado.
- Devuelve `401` si no hay usuario.
- Devuelve campos top-level `status`, `paid`, `payment_status`.
- Lee `user_participation` por `auth.users.id`, no por email hardcodeado.

### `GET /api/predictions/me`

Estado:

- Requiere usuario autenticado.
- Si el usuario no esta active, devuelve `403 payment_required`.
- Si el usuario esta active, lee `prediction_match_scores` desde Supabase.
- No usa `localStorage`.

### `POST /api/predictions/save-match`

Estado:

- Requiere usuario autenticado.
- Exige `user_participation.status = active`, `paid = true`, `payment_status = approved`.
- Permite scores con cero: `0-0`, `0-1`, etc.
- Guarda en `prediction_match_scores`.
- Usa upsert por `user_id + match_id`.
- Devuelve `completedMatches`.
- Bloquea partidos cuyo `kickoff_at` ya paso.

### `POST /api/predictions/sync-draft`

Hallazgo corregido durante auditoria:

- Antes no aceptaba el wrapper requerido `{ scores: [...] }`.
- Antes podia convertir `payment_required` en error 500.

Correccion aplicada:

- Acepta `scores`, `draft`, `predictions` o un array directo.
- Requiere usuario autenticado.
- Exige usuario active.
- Devuelve `403 payment_required` si no corresponde guardar.
- Devuelve el resultado de `syncOfficialPredictionDraft`, incluyendo `completedMatches`.

### `POST /api/private-groups/create`

Estado:

- Requiere usuario autenticado.
- Exige participacion active/paga/aprobada.
- Crea registro en `private_groups`.
- Crea membresia owner en `private_group_members` con `role = owner`.
- Devuelve `inviteCode` e `inviteUrl`.

### `GET /api/private-groups/mine`

Estado:

- Requiere usuario autenticado.
- Lista solo grupos donde el usuario es miembro.
- No expone grupos privados de otros usuarios.

## Cuenta

`/cuenta` usa `getAccountDashboard(userId)`, y ese helper llama a:

- `getOfficialPredictionSummary(userId)`

Ese resumen cuenta filas reales en `prediction_match_scores`, no `localStorage`.

Con el usuario de prueba, despues de guardar 2 partidos oficiales, `/cuenta` deberia mostrar:

- `2 / 104`

## Validacion con usuario active

Usuario:

- `germangonzalezmdq@gmail.com`

Estado real:

```json
{
  "status": "active",
  "paid": true,
  "payment_status": "approved"
}
```

Prueba directa contra Supabase/server helpers:

```json
{
  "active": true,
  "saveA": {
    "ok": true,
    "saved": true,
    "matchId": "1",
    "completedMatches": 1
  },
  "saveB": {
    "ok": true,
    "saved": true,
    "matchId": "2",
    "completedMatches": 2
  },
  "completedMatches": 2,
  "hasZeroZero": true,
  "createdGroup": {
    "name": "Audit Backend 1779069558527",
    "inviteCode": "LVHTTYVH",
    "inviteUrl": "https://mundialentreamigos.online/grupos/invitar/LVHTTYVH"
  },
  "myGroupsCount": 2
}
```

Resultado:

- El usuario active pudo guardar predicciones oficiales.
- `0-1` fue valido.
- `0-0` fue valido.
- El conteo oficial quedo en `2`.
- Se creo grupo privado y membresia owner.

## Validacion con usuario no active

Usuario no active encontrado:

```json
{
  "status": "pending_payment",
  "paid": false,
  "payment_status": "pending"
}
```

Resultado:

- Guardar prediccion oficial fue bloqueado con `PaymentRequiredError`.
- Crear grupo privado fue bloqueado con `PaymentRequiredError`.

## Prueba HTTP local

`localhost:3000` respondio `404` para las rutas API revisadas, lo que indica que ese puerto no estaba sirviendo esta app o estaba con una instancia vieja.

`localhost:3001` no respondio dentro del timeout de 3 segundos durante esta auditoria.

Por eso la validacion funcional se hizo contra los helpers server y Supabase real.

## Veredicto antes de push

Seguro para push con esta salvedad:

- La correccion aplicada en `POST /api/predictions/sync-draft` debe incluirse antes del push, porque el endpoint tenia un desajuste con el contrato esperado.

No se detectaron archivos ajenos al flujo prediccion/cuenta/grupos en el commit auditado.

## Pendiente operativo

Aplicar en Supabase real:

- `supabase/migrations/011_prediction_save_and_private_groups_runtime.sql`

El backend ya tiene fallback si `prediction_match_scores.completed` no existe, pero la migracion deja el schema alineado con la regla definitiva.
