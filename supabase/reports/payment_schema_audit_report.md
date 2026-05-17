# Payment schema audit report

## Fecha

2026-05-17

## Tablas auditadas en Supabase real

Consulta realizada con `SUPABASE_SERVICE_ROLE_KEY`, sin imprimir secretos.

| Tabla | Existe en Supabase | Resultado |
| --- | --- | --- |
| `profiles` | Si | Accesible con service role |
| `user_participation` | Si | Columnas esperadas principales disponibles |
| `payments` | Si | Existe, pero faltaba `product_code` antes de migración |
| `prediction_entries` | Si | Accesible con service role |
| `prediction_match_scores` | Si | Columnas `home_goals` / `away_goals` disponibles |
| `prediction_specials` | Si | Accesible con service role |
| `private_groups` | Si | Accesible con service role |
| `private_group_members` | Si | Accesible con service role |

## Migración creada

Archivo:

`supabase/migrations/009_payment_participation_schema.sql`

La migración es idempotente y usa:

- `create table if not exists`
- `alter table ... add column if not exists`
- `create index if not exists`
- policies creadas solo si no existen
- `enable row level security`

## Tablas cubiertas por la migración

- `profiles`
- `user_participation`
- `payments`
- `prediction_entries`
- `prediction_match_scores`
- `prediction_specials`
- `private_groups`
- `private_group_members`

## Columnas críticas para checkout

`payments` queda preparado con:

- `product_code`
- `provider`
- `provider_payment_id`
- `provider_order_id`
- `provider_preference_id`
- `provider_capture_id`
- `external_reference`
- `status`
- `amount`
- `currency`
- `raw_payload`
- `paid_at`

`user_participation` queda preparado con:

- `status`
- `paid`
- `payment_status`
- `paid_at`
- `payment_provider`
- `payment_reference`
- `payment_id`
- `amount`
- `currency`

## RLS y seguridad

Regla aplicada:

- El usuario autenticado puede leer su `user_participation`.
- El usuario autenticado puede leer sus `payments`.
- No hay policy de `insert`, `update` ni `delete` para `payments` desde frontend.
- No hay policy de `insert`, `update` ni `delete` para `user_participation` desde frontend.
- Solo service role/server puede insertar pagos, marcar `approved` y activar participación.

## Pruebas de cliente anon

Se probó con anon key:

- `payments` insert `approved`: bloqueado con `permission denied for table payments`.
- `user_participation` insert `active`: no accesible desde schema cache para anon.
- `prediction_match_scores` insert 0-0 sin auth: no accesible desde schema cache para anon.

Conclusión:

El cliente público no puede activar pagos ni participación oficial.

## Prediction match scores

La migración permite explícitamente:

```sql
check (home_goals >= 0 and away_goals >= 0)
```

Esto permite resultados `0-0`.

## Compatibilidad con endpoints de pago

Los endpoints creados en el commit anterior requieren que esta migración esté aplicada antes de producción.

Estado detectado antes de aplicar migración:

- `payments.product_code` no existía en Supabase real.

Impacto:

- `POST /api/payments/mercadopago/create-preference`
- `POST /api/payments/paypal/create-order`

fallarían al crear `payments` si la migración no se aplica.

## Aplicación remota

No se ejecutó DDL remoto desde Codex porque el proyecto no expone conexión SQL directa en este entorno. La migración está lista para correr desde Supabase SQL Editor o el flujo de migraciones del proyecto.

## Recomendación antes de pushear checkout

1. Aplicar `supabase/migrations/009_payment_participation_schema.sql` en Supabase.
2. Verificar que `payments.product_code` exista.
3. Verificar que `user_participation.payment_provider`, `payment_reference` y `payment_id` existan.
4. Recién después pushear/deployar el checkout.
