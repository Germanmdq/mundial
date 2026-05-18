# Group stage payments and prize pool rules report

## Fecha

2026-05-18

## Pagos

Regla aplicada:

- Para iniciar checkout solo hace falta usuario autenticado.
- `pending_payment` no bloquea checkout.
- `draft`, `unpaid`, `pending_payment`, `rejected`, `cancelled` y `null` pueden iniciar pago.
- `active + paid + approved` devuelve `alreadyActive` y no crea nuevo checkout.
- `markParticipationPendingPayment` no degrada una participacion activa.
- `GET /api/payments/status` solo lee estado; no crea pagos ni cambia `user_participation`.

## Status

`GET /api/payments/status` devuelve:

- `loggedIn`
- `user`
- `participation`
- `isActive`
- `canStartPayment`

`canStartPayment` es `true` para usuarios logueados que no estan activos, incluyendo `pending_payment`.

## Predicciones

Regla aplicada:

- Por ahora solo se aceptan predicciones de fase de grupos.
- Backend valida `matches.stage = GROUP` antes de guardar.
- `POST /api/predictions/save-match` y `POST /api/predictions/sync-draft` devuelven `403 prediction_stage_locked` para partidos fuera de fase de grupos.
- `0-0` y `0-1` siguen siendo validos.
- `GET /api/predictions/me` devuelve progreso actual de fase de grupos:
  - `completedMatches`
  - `totalMatches = 72`
  - `remainingMatches`
  - `currentStage = group_stage`

## Especiales

Se bloquearon temporalmente:

- `POST /api/predictions/specials`
- `POST /api/predictions/champion`
- `POST /api/predictions/top-scorer`

Respuesta:

```json
{
  "error": "special_predictions_locked",
  "message": "Campeón y goleador se habilitarán en una segunda etapa."
}
```

## Pozo acumulado

Regla aplicada:

- Base minima: 47 participantes.
- Entrada: $5.000 ARS.
- Pozo minimo: $235.000 ARS.
- Participantes visibles: `max(47, activePaidUsersCount)`.
- Si DolarAPI falla, se usa fallback seguro.

Endpoints:

- `GET /api/public/prize-pool`
- `GET /api/prize-pool`

Respuesta incluye:

- `participants`
- `entryAmountARS`
- `poolARS`
- `usdBlueRate`
- `poolUSDApprox`
- `source`
- `updatedAt`

## Puntuacion

Constantes oficiales:

- Marcador exacto: 5
- Tendencia + diferencia: 4
- Solo tendencia: 3
- Incorrecto: 0

Distribucion del pozo:

- Ranking general: 70%
- Campeon: 15%
- Goleador: 15%

Campeon y goleador no suman al ranking general.
