# Payment endpoint test report

## Fecha

2026-05-17

## Objetivo

Verificar Mercado Pago Checkout Pro ARS 5000 y PayPal USD 5 despues de aplicar la migracion 009.

Regla de seguridad:

- Crear cuenta no activa participacion oficial.
- Pago confirmado por server/webhook/capture activa participacion.
- El frontend no marca `paid`.
- El frontend no marca `active`.

## Migracion 009

Estado: verificada en Supabase real.

Columnas criticas confirmadas:

- `payments.product_code`
- `payments.provider_capture_id`
- `payments.provider_order_id`
- `payments.provider_preference_id`
- `payments.paid_at`
- `user_participation.paid`
- `user_participation.paid_at`
- `user_participation.payment_provider`
- `user_participation.payment_reference`
- `user_participation.payment_status`

## Variables de proveedores

Verificadas localmente sin imprimir secretos:

| Variable | Estado |
| --- | --- |
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

## Prueba HTTP local

No se pudo levantar un servidor nuevo para prueba HTTP porque el entorno local sigue fallando por firma invalida del binario `@next/swc-darwin-arm64`.

Tambien se detecto que `localhost:3000` responde una app/instancia que no tiene los endpoints de pagos actuales, devolviendo 404 para `/api/payments/...`.

Por ese motivo, la prueba con proveedor se hizo ejecutando los mismos helpers server que usan los endpoints, contra Supabase real y APIs reales de Mercado Pago / PayPal.

## Prueba sin login

Resultado por revision de endpoints:

- `POST /api/payments/mercadopago/create-preference` devuelve `401` si `supabase.auth.getUser()` no devuelve usuario.
- `POST /api/payments/paypal/create-order` devuelve `401` si `supabase.auth.getUser()` no devuelve usuario.
- `GET /api/payments/status` devuelve `401` si no hay usuario.

No se pudo confirmar por HTTP local por el bloqueo SWC/instancia desactualizada explicado arriba.

## Mercado Pago create preference

Estado: probado contra API real de Mercado Pago mediante helper server.

Resultado:

- Payment interno creado en Supabase.
- `provider = mercadopago`.
- `product_code = worldcup_prize_entry`.
- `amount = 5000`.
- `currency = ARS`.
- `status = pending`.
- `provider_preference_id` guardado.
- `init_point` devuelto: si.
- Host de `init_point`: `www.mercadopago.com.ar`.
- `user_participation.status = pending_payment`.
- `user_participation.paid = false`.
- `user_participation.payment_status = pending`.
- No activo participacion.

Payment de prueba generado:

- `payments.id = 2`
- `provider_preference_id = 1344006304-8312c4c3-1d6b-4a4e-80bf-b3f0bad56909`

## PayPal create order

Estado: probado contra PayPal live mediante helper server.

Resultado:

- Payment interno creado en Supabase.
- `provider = paypal`.
- `product_code = worldcup_prize_entry`.
- `amount = 5`.
- `currency = USD`.
- `status = pending`.
- `provider_order_id` guardado.
- `approve_url` devuelto: si.
- Host de `approve_url`: `www.paypal.com`.
- Order status: `CREATED`.
- `user_participation.status = pending_payment`.
- `user_participation.paid = false`.
- `user_participation.payment_status = pending`.
- No activo participacion.

Payment de prueba generado:

- `payments.id = 3`
- `provider_order_id = 6A049684LB826104A`

## Webhook / capture

No se ejecuto un pago real aprobado/capturado.

Confirmacion por codigo:

- Mercado Pago solo activa si el webhook recibe un pago aplicable, consulta Mercado Pago con `MERCADOPAGO_ACCESS_TOKEN`, obtiene `status = approved`, marca `payments.status = approved` y luego llama `activateUserParticipationFromPayment`.
- PayPal capture solo activa si `capturePayPalOrder(orderId)` devuelve `COMPLETED`.
- PayPal webhook solo activa con `PAYMENT.CAPTURE.COMPLETED`.
- Estados `pending`, `rejected`, `cancelled`, `refunded` o errores no activan participacion.

## Paginas de retorno

`/pago/exito` no activa participacion por si sola.

La pagina consulta estado y puede mostrar estado activo solo si `/api/payments/status` ya devuelve participacion activa. La activacion sigue dependiendo del webhook/capture server-side.

## Frontend

Confirmacion:

- El frontend no actualiza `payments.status = approved`.
- El frontend no actualiza `user_participation.status = active`.
- El frontend solo inicia checkout y lee estado.

## Error encontrado y corregido

Supabase real usa `payments.id` numerico. El helper anterior intentaba escribir ese valor en `user_participation.payment_id`, que es UUID.

Error observado:

`invalid input syntax for type uuid: "1"`

Correccion:

- `src/lib/server/payments.ts` ahora solo escribe `payment_id` si el id interno tiene formato UUID.
- Los pagos numericos siguen funcionando para lookup interno y `external_reference`.
- La referencia final del proveedor se guarda en `payment_reference` cuando el pago queda aprobado.

## Pendientes antes de produccion

1. Configurar webhook Mercado Pago:
   - `https://mundialentreamigos.online/api/payments/mercadopago/webhook`
2. Configurar webhook PayPal:
   - `https://mundialentreamigos.online/api/payments/paypal/webhook`
3. Ejecutar un pago real/sandbox aprobado para confirmar:
   - Mercado Pago webhook `approved`.
   - PayPal capture `COMPLETED`.
   - `user_participation.status = active`.
4. Confirmar que el deploy de Vercel usa el ultimo commit de pagos.

## Conclusion

Mercado Pago crea `init_point` correctamente.

PayPal crea `approve_url` correctamente.

La base queda en `pending_payment` y no activa participacion hasta confirmacion server-side.
