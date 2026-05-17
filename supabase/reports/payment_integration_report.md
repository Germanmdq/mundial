# Payment integration report

## Endpoints creados

- `POST /api/payments/mercadopago/create-preference`
- `POST /api/payments/mercadopago/webhook`
- `POST /api/payments/paypal/create-order`
- `GET /api/payments/paypal/capture`
- `POST /api/payments/paypal/webhook`
- `GET /api/payments/status`

## Helpers creados

- `src/lib/server/payments.ts`
- `src/lib/server/mercadopago.ts`
- `src/lib/server/paypal.ts`

## Páginas de retorno

- `/pago/exito`
- `/pago/pendiente`
- `/pago/error`

## Flujo de estados

1. Usuario logueado inicia checkout.
2. Server crea `payments.status = pending`.
3. Server marca `user_participation.status = pending_payment`.
4. Proveedor confirma pago.
5. Server consulta/captura el pago.
6. Solo si el pago está aprobado/completado:
   - `payments.status = approved`
   - `user_participation.status = active`
   - `paid = true`
   - `payment_status = approved`

## Pruebas realizadas

- Lint global: pasa con warnings existentes de `<img>`/fuentes/hooks.
- TypeScript: pasa con `~/.bun/bin/bun x tsc --noEmit`.
- Endpoints sin login: implementados para devolver `401` en create-preference/create-order/status.
- Activación desde frontend: no existe endpoint cliente para marcar `paid` o `active`.
- `/pago/exito`: no activa participación, solo informa retorno.
- Pruebas reales con proveedores: pendientes por requerir credenciales sandbox/producción.

## Pendientes

- Configurar env vars de Mercado Pago y PayPal en Vercel.
- Configurar webhook Mercado Pago:
  `https://mundialentreamigos.online/api/payments/mercadopago/webhook`
- Configurar webhook PayPal:
  `https://mundialentreamigos.online/api/payments/paypal/webhook`
- Confirmar que Supabase tiene todas las columnas requeridas en `payments` y `user_participation`.
- Probar checkout real sandbox con usuario autenticado.
