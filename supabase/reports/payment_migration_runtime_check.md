# Payment migration runtime check

## Fecha

2026-05-17

## Contexto

Se verifico Supabase real despues de aplicar `supabase/migrations/009_payment_participation_schema.sql`.

## Variables disponibles localmente

Verificadas sin imprimir secretos completos:

| Variable | Estado |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | presente: `https://mundialentreamigos.online` |
| `NEXT_PUBLIC_SUPABASE_URL` | presente |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | presente |
| `SUPABASE_SERVICE_ROLE_KEY` | presente |
| `MERCADOPAGO_ACCESS_TOKEN` | presente |
| `MERCADOPAGO_PUBLIC_KEY` | presente |
| `MERCADOPAGO_WEBHOOK_SECRET` | faltante, aceptado por ahora |
| `PAYPAL_CLIENT_ID` | presente |
| `PAYPAL_CLIENT_SECRET` | presente |
| `PAYPAL_ENV` | presente: `live` |
| `PRIZE_ENTRY_AMOUNT_ARS` | presente: `5000` |
| `PRIZE_ENTRY_CURRENCY_ARS` | presente: `ARS` |
| `PRIZE_ENTRY_AMOUNT_USD` | presente: `5` |
| `PRIZE_ENTRY_CURRENCY_USD` | presente: `USD` |

## Verificacion runtime en Supabase real

Consulta realizada con `SUPABASE_SERVICE_ROLE_KEY`, sin imprimir secretos.

| Recurso | Estado runtime |
| --- | --- |
| `payments.product_code` | existe |
| `payments.provider_order_id` | existe |
| `payments.provider_preference_id` | existe |
| `payments.provider_capture_id` | existe |
| `payments.paid_at` | existe |
| `payments.raw_payload` | existe |
| `user_participation.paid` | existe |
| `user_participation.paid_at` | existe |
| `user_participation.payment_provider` | existe |
| `user_participation.payment_reference` | existe |
| `user_participation.payment_status` | existe |

## Resultado

La migracion 009 quedo aplicada y verificada en Supabase real para las columnas criticas de checkout.

Los endpoints ya pueden escribir:

- `payments.product_code`
- `payments.provider_preference_id`
- `payments.provider_order_id`
- `payments.provider_capture_id`
- `payments.raw_payload`
- `user_participation.payment_provider`
- `user_participation.payment_reference`
- `user_participation.payment_status`
- `user_participation.paid`
- `user_participation.paid_at`

## Hallazgo de compatibilidad

Durante la prueba runtime, Supabase real devolvio `payments.id` como valor numerico (`1`, `2`, `3`) en vez de UUID.

La columna `user_participation.payment_id` es UUID, por lo que guardar un id numerico ahi falla con:

`invalid input syntax for type uuid: "1"`

Se ajusto `src/lib/server/payments.ts` para escribir `payment_id` solo cuando el id interno del pago tiene formato UUID. La referencia del proveedor se sigue guardando en `payment_reference` cuando el pago queda aprobado.

## Conclusion

El esquema requerido para checkout esta disponible. El codigo de pagos quedo ajustado para convivir con el `payments.id` real actual.
