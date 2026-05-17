# Payment migration runtime check

## Fecha

2026-05-17

## Contexto

Se verifico Supabase real antes de probar checkout Mercado Pago / PayPal.

La migracion requerida es:

`supabase/migrations/009_payment_participation_schema.sql`

## Variables disponibles localmente

Verificadas sin imprimir secretos completos:

| Variable | Estado |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | presente: `https://mundialentreamigos.online` |
| `NEXT_PUBLIC_SUPABASE_URL` | presente |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | presente |
| `SUPABASE_SERVICE_ROLE_KEY` | presente |
| `MERCADOPAGO_ACCESS_TOKEN` | faltante |
| `MERCADOPAGO_PUBLIC_KEY` | faltante |
| `MERCADOPAGO_WEBHOOK_SECRET` | faltante |
| `PAYPAL_CLIENT_ID` | faltante |
| `PAYPAL_CLIENT_SECRET` | faltante |
| `PAYPAL_ENV` | faltante |
| `PRIZE_ENTRY_AMOUNT_ARS` | faltante |
| `PRIZE_ENTRY_CURRENCY_ARS` | faltante |
| `PRIZE_ENTRY_AMOUNT_USD` | faltante |
| `PRIZE_ENTRY_CURRENCY_USD` | faltante |

## Verificacion runtime en Supabase real

Consulta realizada con `SUPABASE_SERVICE_ROLE_KEY`, sin imprimir secretos.

| Recurso | Estado runtime |
| --- | --- |
| `payments.product_code` | falta |
| `payments.provider_order_id` | existe |
| `payments.provider_preference_id` | existe |
| `payments.provider_capture_id` | falta |
| `payments.raw_payload` | existe |
| `user_participation.payment_provider` | no disponible en schema cache |
| `user_participation.payment_reference` | no disponible en schema cache |
| `user_participation.payment_status` | no disponible en schema cache |
| `user_participation.paid` | no disponible en schema cache |
| `user_participation.paid_at` | no disponible en schema cache |

Errores observados:

- `column payments.product_code does not exist`
- `column payments.provider_capture_id does not exist`
- `Could not find the table 'public.user_participation' in the schema cache`

## Resultado

La migracion 009 es necesaria y no esta aplicada completamente en Supabase real.

No se continuo con pruebas reales de checkout porque los endpoints de creacion de pagos dependen de `payments.product_code` y de las columnas de participacion. Probar checkout en este estado produciria falsos errores de aplicacion cuando el bloqueo real es de esquema.

## Aplicacion de migracion

No se aplico DDL remoto desde Codex porque este entorno no tiene `DATABASE_URL` / `SUPABASE_DB_URL` ni una conexion SQL directa configurada. `SUPABASE_SERVICE_ROLE_KEY` sirve para operaciones REST/admin, pero no para ejecutar `alter table` directamente.

Para avanzar:

1. Abrir Supabase SQL Editor.
2. Ejecutar `supabase/migrations/009_payment_participation_schema.sql`.
3. Volver a verificar que existan:
   - `payments.product_code`
   - `payments.provider_capture_id`
   - `user_participation.payment_provider`
   - `user_participation.payment_reference`
   - `user_participation.payment_status`
   - `user_participation.paid`
   - `user_participation.paid_at`

## Conclusion

Estado actual: checkout no debe pushearse como probado en produccion hasta aplicar/verificar la migracion 009 y configurar credenciales Mercado Pago / PayPal.
