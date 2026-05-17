# Payment endpoint test report

## Fecha

2026-05-17

## Objetivo

Verificar Mercado Pago Checkout Pro ARS 5000 y PayPal USD 5 antes de pushear checkout.

Regla de seguridad validada a nivel de diseno:

- Crear cuenta no activa participacion oficial.
- Pago confirmado por server/webhook/capture activa participacion.
- El frontend no marca `paid`.
- El frontend no marca `active`.

## Bloqueo principal

La migracion `009_payment_participation_schema.sql` no esta aplicada completamente en Supabase real.

Faltan columnas criticas:

- `payments.product_code`
- `payments.provider_capture_id`

Ademas `user_participation` no aparece disponible en PostgREST schema cache durante la verificacion runtime de sus columnas.

Por este motivo no se ejecutaron pruebas reales de creacion de preference/order contra proveedores. El checkout puede fallar antes de llegar a Mercado Pago / PayPal si intenta crear el registro interno en `payments`.

## Variables de proveedores

Verificadas localmente sin imprimir secretos:

| Variable | Estado |
| --- | --- |
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

Variables base presentes:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Endpoints revisados

| Endpoint | Resultado |
| --- | --- |
| `GET /api/payments/status` | No probado end-to-end por migracion incompleta |
| `POST /api/payments/mercadopago/create-preference` | No probado contra Mercado Pago por falta de migracion y credenciales |
| `POST /api/payments/mercadopago/webhook` | No probado contra evento real por falta de credenciales/webhook |
| `POST /api/payments/paypal/create-order` | No probado contra PayPal por falta de migracion y credenciales |
| `GET /api/payments/paypal/capture` | No probado contra capture real por falta de credenciales/order |
| `POST /api/payments/paypal/webhook` | No probado contra evento real por falta de credenciales/webhook |

## Resultado esperado sin login

Los endpoints de creacion de checkout estan implementados para requerir usuario autenticado:

- Mercado Pago create preference debe devolver `401` sin usuario.
- PayPal create order debe devolver `401` sin usuario.
- Status debe devolver `401` o estado no autenticado controlado sin usuario.

No se hizo prueba HTTP local porque no cambia el bloqueo principal: antes del checkout real hay que aplicar la migracion.

## Mercado Pago

Estado: no probado con proveedor real.

Motivos:

1. Falta `MERCADOPAGO_ACCESS_TOKEN`.
2. Falta `MERCADOPAGO_PUBLIC_KEY`.
3. Falta `MERCADOPAGO_WEBHOOK_SECRET`.
4. Falta aplicar migracion 009 en Supabase real.

No se obtuvo `init_point`.

Condicion para activar participacion:

- Solo webhook aprobado, luego de consultar el pago real con `MERCADOPAGO_ACCESS_TOKEN`.
- `/pago/exito` no activa participacion.

## PayPal

Estado: no probado con proveedor real.

Motivos:

1. Falta `PAYPAL_CLIENT_ID`.
2. Falta `PAYPAL_CLIENT_SECRET`.
3. Falta `PAYPAL_ENV`.
4. Falta aplicar migracion 009 en Supabase real.

No se obtuvo `approve_url`.

Condicion para activar participacion:

- Solo `capture` server-side con estado `COMPLETED`, o webhook `PAYMENT.CAPTURE.COMPLETED`.
- Volver desde PayPal sin capture exitoso no activa participacion.

## Paginas de retorno

Diseno esperado:

- `/pago/exito` informa que el pago fue recibido y esta en confirmacion.
- `/pago/pendiente` informa que el pago esta pendiente.
- `/pago/error` permite volver a cuenta.

Confirmacion de seguridad:

- `/pago/exito` no debe marcar `active` por si sola.
- El estado final debe venir de `/api/payments/status` y de cambios server-side en Supabase.

## Frontend

Confirmacion de seguridad:

- El frontend no debe insertar pagos aprobados.
- El frontend no debe actualizar `user_participation.status = active`.
- El frontend solo debe iniciar checkout y leer estado.

La auditoria previa de RLS indico que el cliente anon no puede insertar pagos aprobados ni activar participacion.

## Pendientes antes de produccion

1. Aplicar `supabase/migrations/009_payment_participation_schema.sql` en Supabase real.
2. Verificar `payments.product_code` y columnas de `user_participation`.
3. Cargar variables Mercado Pago en Vercel/local:
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `MERCADOPAGO_PUBLIC_KEY`
   - `MERCADOPAGO_WEBHOOK_SECRET`
4. Cargar variables PayPal en Vercel/local:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENV=sandbox` o `live`
5. Cargar montos:
   - `PRIZE_ENTRY_AMOUNT_ARS=5000`
   - `PRIZE_ENTRY_CURRENCY_ARS=ARS`
   - `PRIZE_ENTRY_AMOUNT_USD=5`
   - `PRIZE_ENTRY_CURRENCY_USD=USD`
6. Configurar webhook Mercado Pago:
   - `https://mundialentreamigos.online/api/payments/mercadopago/webhook`
7. Configurar webhook PayPal:
   - `https://mundialentreamigos.online/api/payments/paypal/webhook`
8. Repetir prueba end-to-end con usuario real/sandbox.

## Conclusion

No se puede declarar checkout probado todavia.

El codigo queda documentado, pero faltan dos condiciones externas:

1. Migracion 009 aplicada en Supabase real.
2. Credenciales reales/sandbox de Mercado Pago y PayPal configuradas.
