# Payments

La participación oficial se activa únicamente desde confirmación server-side:

- Mercado Pago: webhook + consulta real del pago en API de Mercado Pago.
- PayPal: capture server-side exitoso, y webhook como respaldo.

El frontend nunca debe marcar `paid` ni `active`.

## Variables

```env
NEXT_PUBLIC_APP_URL=https://mundialentreamigos.online
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox

PRIZE_ENTRY_AMOUNT_ARS=5000
PRIZE_ENTRY_CURRENCY_ARS=ARS

PRIZE_ENTRY_AMOUNT_USD=5
PRIZE_ENTRY_CURRENCY_USD=USD
```

No commitear `.env.local`.

## Mercado Pago

Checkout Pro Argentina:

- Monto: ARS 5.000
- Producto: `worldcup_prize_entry`
- Crear preferencia: `POST /api/payments/mercadopago/create-preference`
- Webhook: `POST /api/payments/mercadopago/webhook`

Webhook público:

`https://mundialentreamigos.online/api/payments/mercadopago/webhook`

El endpoint de creación requiere usuario logueado. Crea un `payments` interno en `pending`, crea la preferencia y deja `user_participation.status = pending_payment`.

`/pago/exito` no activa participación. Solo muestra estado de retorno.

## PayPal

Checkout internacional:

- Monto: USD 5
- Crear order: `POST /api/payments/paypal/create-order`
- Capture: `GET /api/payments/paypal/capture`
- Webhook: `POST /api/payments/paypal/webhook`

Webhook público:

`https://mundialentreamigos.online/api/payments/paypal/webhook`

PayPal activa participación únicamente cuando `capturePayPalOrder(orderId)` devuelve `COMPLETED`, o por webhook `PAYMENT.CAPTURE.COMPLETED`.

## Estado unificado

`GET /api/payments/status`

Requiere usuario logueado y devuelve:

```json
{
  "participation": {
    "status": "active",
    "paid": true,
    "payment_status": "approved",
    "provider": "paypal",
    "paid_at": "..."
  },
  "latestPayment": {}
}
```

## Supabase esperado

La integración espera tablas ya preparadas:

- `payments`
- `user_participation`

Campos usados en `payments`:

- `id`
- `user_id`
- `provider`
- `status`
- `amount`
- `currency`
- `product_code`
- `external_reference`
- `provider_payment_id`
- `provider_order_id`
- `provider_preference_id`
- `provider_capture_id`
- `raw_payload`
- `paid_at`
- `created_at`
- `updated_at`

Campos usados en `user_participation`:

- `user_id`
- `status`
- `paid`
- `payment_status`
- `provider`
- `provider_reference`
- `payment_id`
- `amount`
- `currency`
- `paid_at`
- `updated_at`

Si alguna columna no existe, el endpoint va a fallar con error server-side y hay que completar la migración de Supabase antes de producción.

## Pruebas sandbox

Mercado Pago:

1. Configurar `MERCADOPAGO_ACCESS_TOKEN`.
2. Hacer login.
3. `POST /api/payments/mercadopago/create-preference`.
4. Abrir `init_point`.
5. Confirmar que el webhook actualiza `payments.status = approved`.
6. Confirmar que `user_participation.status = active`.

PayPal:

1. Configurar `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV=sandbox`.
2. Hacer login.
3. `POST /api/payments/paypal/create-order`.
4. Abrir `approve_url`.
5. Al volver por capture, confirmar `payments.status = approved`.
6. Confirmar que `user_participation.status = active`.

## Lo que no activa participación

- Volver a `/pago/exito`.
- Recibir un redirect de PayPal sin capture.
- Recibir un webhook que no sea pago aprobado/completado.
- Cualquier acción desde frontend.
