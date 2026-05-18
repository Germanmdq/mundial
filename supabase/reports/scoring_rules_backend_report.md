# Scoring rules backend report

## Fecha

2026-05-17

## Alcance

Se implemento la capa backend para reglas oficiales de puntuacion, ranking y pozo acumulado.

No se tocaron:

- Home / hero
- Mercado Pago backend
- PayPal backend
- scripts WC2026
- importadores
- `.env.local`
- datos base de equipos/jugadores

## Migracion creada

`supabase/migrations/010_official_scoring_prize_pool.sql`

Tabla:

`prediction_scoring_results`

Campos principales:

- `user_id`
- `prediction_id`
- `match_id`
- `predicted_home_score`
- `predicted_away_score`
- `actual_home_score`
- `actual_away_score`
- `points`
- `exact_score`
- `correct_outcome`
- `correct_goal_difference`
- `goal_error`
- `calculated_at`

Restricciones:

- unique `user_id + match_id`
- puntos permitidos: `0`, `3`, `4`, `5`
- goles y error no negativos

RLS:

- usuario autenticado puede leer solo sus resultados.
- escritura queda para service role/backend.

## Reglas de puntuacion implementadas

Helper:

`src/lib/server/scoring.ts`

Funciones:

- `getOutcome(homeScore, awayScore)`
- `calculateMatchPoints(predHome, predAway, realHome, realAway)`
- `calculateUserScore(userId)`
- `recalculateAllScores()`
- `getOfficialLeaderboard()`

Reglas:

| Caso | Puntos |
| --- | ---: |
| Marcador exacto | 5 |
| Tendencia + diferencia de gol | 4 |
| Solo tendencia | 3 |
| Incorrecto | 0 |

Empates:

- `1-1` real y `0-0` predicho da 4 puntos.
- `0-0` real y `0-0` predicho da 5 puntos.
- Fase de grupos no usa penales para scoring.

## Ranking oficial

Endpoint:

`GET /api/scoring/leaderboard`

Incluye solo usuarios con:

- `user_participation.status = active`
- `paid = true`
- `payment_status = approved`

Campos devueltos:

- `user_id`
- `display_name`
- `total_points`
- `exact_scores_count`
- `correct_outcomes_count`
- `correct_goal_differences_count`
- `total_goal_error`
- `scored_matches_count`
- `rank_position`

Desempates backend implementados:

1. Mayor cantidad de puntos.
2. Mayor cantidad de marcadores exactos.
3. Mayor cantidad de tendencias correctas.
4. Mayor cantidad de diferencias correctas.
5. Menor error total de goles.
6. Prediccion/participacion mas temprana como fallback tecnico.
7. Nombre como fallback estable.

Campeon y goleador quedan preparados como criterios conceptuales, pero no se aplican aun porque todavia no existe resultado oficial final de campeon/goleador cargado.

## Scoring del usuario

Endpoint:

`GET /api/scoring/me`

Reglas:

- sin login: `401`
- usuario no active/pagado: `403` con `payment_required`
- usuario active: devuelve puntos, posicion y metricas

## Pozo acumulado

Endpoint:

`GET /api/public/prize-pool`

No expone datos privados.

Reglas:

- participantes = `max(47, activePaidUsersCount)`
- entrada ARS = `5000`
- pool ARS = participantes * 5000
- ranking = 70%
- campeon = 15%
- goleador = 15%
- equivalente USD blue = `poolARS / dolarBlueVenta`

Helper:

`src/lib/prize-pool.ts`

Dolar blue:

`src/lib/currency/dolar-blue.ts`

Fuente:

`https://dolarapi.com/v1/dolares/blue`

Si falla la API, `poolUSDBlue = null` y la UI puede mostrar `USD blue en actualizacion`.

## Validaciones ejecutadas

Script:

`scripts/validate-scoring-rules.ts`

Casos validados:

- Real `2-1`, pred `2-1` => 5
- Real `2-1`, pred `3-2` => 4
- Real `2-1`, pred `3-1` => 3
- Real `2-1`, pred `1-1` => 0
- Real `1-1`, pred `0-0` => 4
- Real `0-0`, pred `0-0` => 5
- Pool 47 participantes => `$235.000 ARS`
- Distribucion `70/15/15` suma 100

Resultado:

`Scoring and prize pool validation passed.`

## Verificacion runtime

Se ejecuto `getOfficialLeaderboard()` contra Supabase real.

Resultado actual:

- usuarios active/pagados: `0`
- ranking oficial: vacio, correcto porque no hay participantes aprobados todavia.

Calculo de ejemplo con dolar blue venta `1200`:

- participantes: `47`
- poolARS: `235000`
- rankingPrizeARS: `164500`
- championPrizeARS: `35250`
- topScorerPrizeARS: `35250`
- poolUSDBlue: `195.83`

## Limitaciones actuales

`matches` en Supabase real todavia no tiene columnas de resultado oficial (`home_score`, `away_score`, `actual_home_score`, etc.).

Por eso `calculateUserScore(userId)` esta preparado para recalcular cuando existan resultados reales, pero no inventa resultados ni asigna puntos si el partido no tiene marcador oficial cargado.

## Validacion tecnica

- `~/.bun/bin/bun x tsx scripts/validate-scoring-rules.ts`: paso.
- `~/.bun/bin/bun x eslint` acotado a backend scoring/prize pool: paso.
- `~/.bun/bin/bun x tsc --noEmit`: paso.
- `~/.bun/bin/bun run lint`: paso con warnings existentes, sin errores.
