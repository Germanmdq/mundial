# Prediction save and private groups backend report

## Fecha

2026-05-17

## Alcance

Se corrigio la capa backend/server para:

- detectar correctamente usuarios con participacion activa;
- guardar prediccion oficial solo para usuarios pagos;
- sincronizar drafts locales a Supabase solo si el usuario esta activo;
- leer la prediccion oficial desde Supabase;
- alimentar `/cuenta` con conteo oficial desde `prediction_match_scores`;
- crear y listar grupos privados usando las tablas reales `private_groups` y `private_group_members`.

No se tocaron:

- Home / hero;
- diseno frontend general;
- Mercado Pago / PayPal / webhooks;
- scripts WC2026;
- importadores;
- datos base de equipos/jugadores;
- `.env.local`;
- Vercel config.

## Estado active auditado

Usuario de prueba:

`germangonzalezmdq@gmail.com`

Supabase Auth:

`ee0e5492-7852-417a-8c07-a4aa3e8b9209`

`user_participation` real:

- `status = active`
- `paid = true`
- `payment_status = approved`
- `payment_provider = mercadopago`
- `payment_reference = manual-test-german-001`

`GET /api/payments/status` fue ajustado para devolver tambien campos top-level:

```json
{
  "status": "active",
  "paid": true,
  "payment_status": "approved",
  "participation": {
    "status": "active",
    "paid": true,
    "payment_status": "approved"
  }
}
```

El endpoint sigue buscando por `auth.users.id`; no hay email hardcodeado.

## Tablas reales auditadas

### `prediction_match_scores`

Columnas reales confirmadas:

- `id`
- `entry_id`
- `user_id`
- `match_id`
- `home_goals`
- `away_goals`
- `created_at`
- `updated_at`

Columna faltante:

- `completed`

Se creo migracion segura para agregarla:

`supabase/migrations/011_prediction_save_and_private_groups_runtime.sql`

Mientras esa migracion no este aplicada, el backend guarda y cuenta filas como completadas. Cuando `completed` exista, el backend la escribe como `true`.

### `private_groups`

Columnas reales confirmadas:

- `id`
- `name`
- `slug`
- `invite_code`
- `owner_id`
- `created_at`
- `updated_at`

### `private_group_members`

Columnas reales confirmadas:

- `id`
- `group_id`
- `user_id`
- `role`
- `joined_at`

### Tablas antiguas no disponibles en Supabase real

- `groups`
- `group_members`

Por eso se corrigieron las server actions de grupos para usar `private_groups` / `private_group_members`.

## Migracion creada

`supabase/migrations/011_prediction_save_and_private_groups_runtime.sql`

Incluye:

- `prediction_match_scores.completed boolean not null default true`
- indice unico `prediction_match_scores(user_id, match_id)`
- indice `prediction_match_scores(user_id, completed)`
- `private_groups.updated_at`
- indice unico `private_groups.invite_code`
- indice unico `private_group_members(group_id, user_id)`

## Endpoints creados

### `POST /api/predictions/save-match`

Entrada:

```json
{
  "matchId": "1",
  "homeScore": 0,
  "awayScore": 1
}
```

Reglas:

- requiere usuario logueado;
- requiere `status = active`, `paid = true`, `payment_status = approved`;
- `0`, `0-0` y `0-1` son validos;
- guarda en `prediction_match_scores`;
- usa upsert por `user_id + match_id`;
- no guarda si el partido ya esta bloqueado por `kickoff_at`.

Si no esta active:

```json
{
  "error": "payment_required",
  "message": "Activá tu participación para guardar tu predicción oficial."
}
```

### `POST /api/predictions/sync-draft`

Entrada:

```json
{
  "scores": [
    { "matchId": "1", "homeScore": 0, "awayScore": 1 }
  ]
}
```

Reglas:

- solo usuarios active;
- guarda todos los scores validos;
- no duplica;
- `0-0` valido.

### `GET /api/predictions/me`

Devuelve prediccion oficial desde Supabase:

```json
{
  "scores": [
    {
      "matchId": "1",
      "homeScore": 0,
      "awayScore": 1,
      "completed": true
    }
  ],
  "completedMatches": 1
}
```

### `POST /api/private-groups/create`

Entrada:

```json
{
  "name": "Nombre del grupo"
}
```

Reglas:

- requiere usuario logueado;
- requiere participacion active/pagada/aprobada;
- crea `private_groups`;
- crea membresia owner en `private_group_members`;
- devuelve `inviteCode` e `inviteUrl`.

### `GET /api/private-groups/mine`

Devuelve grupos donde el usuario autenticado es miembro.

No expone grupos privados de otros usuarios.

## Server actions corregidas

### `src/app/actions/predictions.ts`

Antes guardaba en tabla vieja `predictions`.

Ahora usa:

- `syncOfficialPredictionDraft`
- tabla `prediction_match_scores`
- gating por `user_participation active`

### `src/app/actions/groups.ts`

Antes usaba tablas viejas `groups` / `group_members`.

Ahora usa:

- `private_groups`
- `private_group_members`
- gating por `user_participation active`

## Validacion con German active

Prueba server directa contra Supabase real:

```json
{
  "status": {
    "status": "active",
    "paid": true,
    "payment_status": "approved"
  },
  "saveResult": {
    "ok": true,
    "saved": true,
    "matchId": "1",
    "completedMatches": 1
  },
  "officialPredictionCount": 1,
  "latestOfficialPrediction": {
    "matchId": "1",
    "homeScore": 0,
    "awayScore": 1,
    "completed": true
  }
}
```

Grupo creado:

```json
{
  "id": "d5c7c6af-dc82-4aec-8987-4e6c23dff33f",
  "name": "Grupo Test German 1779069161677",
  "inviteCode": "A8WXPZRH",
  "inviteUrl": "https://mundialentreamigos.online/grupos/invitar/A8WXPZRH"
}
```

## Validacion no active

Usuario no active:

- guardar prediccion: `PaymentRequiredError`
- crear grupo privado: `PaymentRequiredError`

## SQL de validacion manual

Predicciones oficiales de German:

```sql
select
  pms.*
from public.prediction_match_scores pms
join auth.users au on au.id = pms.user_id
where lower(au.email) = lower('germangonzalezmdq@gmail.com')
order by pms.updated_at desc;
```

Resultado observado:

- `match_id = 1`
- `home_goals = 0`
- `away_goals = 1`
- `updated_at = 2026-05-18T01:52:39.479+00:00`

Grupos privados de German:

```sql
select
  pg.*
from public.private_groups pg
join auth.users au on au.id = pg.owner_id
where lower(au.email) = lower('germangonzalezmdq@gmail.com');
```

Resultado observado:

- `Grupo Test German 1779069161677`
- `invite_code = A8WXPZRH`

## Pendientes

Aplicar `supabase/migrations/011_prediction_save_and_private_groups_runtime.sql` en Supabase real para que `prediction_match_scores.completed` exista fisicamente.

El backend ya funciona antes de aplicar esa columna porque usa fallback y cuenta filas guardadas como completas, pero la migracion deja el schema alineado con la regla final.
