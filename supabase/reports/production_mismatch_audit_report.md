# Production mismatch audit

Fecha: 2026-05-18

## Commits y deploy

- `origin`: `https://github.com/Germanmdq/mundial.git`
- `HEAD` local auditado: `6049982 feat(frontend): limit to group stage phase 1, align prizes and scores, gate account page for active users, and improve mobile layout`
- `origin/main` auditado: `6049982 feat(frontend): limit to group stage phase 1, align prizes and scores, gate account page for active users, and improve mobile layout`

Conclusión: el commit reportado por frontend sí está en `origin/main`. Si producción muestra una versión anterior después de este commit, Vercel debería revisarse por deploy stale/cache o por una build que no haya tomado `origin/main`.

## Archivos/rutas encontradas

Rutas relevantes:

- `src/app/activar-participacion/page.tsx`
- `src/app/cuenta/page.tsx`
- `src/app/equipos/page.tsx`
- `src/app/mi-prediccion/grupos/page.tsx`
- `src/app/mi-prediccion/page.tsx`
- `src/app/premios/page.tsx`

Componentes relevantes:

- `src/components/prediction/PredictionScreen.tsx`
- `src/components/prediction/PredictionForm.tsx`
- `src/components/prizes/PremiosClient.tsx`
- `src/components/account/AccountDashboardClient.tsx`
- `src/components/account/AccountDashboard.tsx`
- `src/components/prizes/PrizePoolBanner.tsx`

No se detectó una segunda ruta `src/app/mi-prediccion/page.tsx` duplicada. Sí hay componentes antiguos con textos/constantes que pueden seguir apareciendo si Vercel despliega una build stale o si esas pantallas aún consumen props viejos.

## Strings viejos detectados

`104` todavía aparece en:

- `src/components/account/AccountDashboardClient.tsx`
- `src/components/account/AccountDashboard.tsx`
- `src/components/prediction/PredictionForm.tsx`
- `src/app/activar-participacion/page.tsx`
- componentes de Home/Jugadores donde el texto puede describir el Mundial completo, no necesariamente la fase actual.

`Goleador` todavía aparece en:

- `src/components/prediction/PredictionForm.tsx`
- `src/components/account/AccountDashboardClient.tsx`
- `src/components/prizes/PremiosClient.tsx`
- `src/components/rules/RulesAccordion.tsx`
- `src/components/apple-replica/AppleReplicaLanding.tsx`

Strings viejos de premios/pending:

- `src/components/prizes/PremiosClient.tsx` conserva referencias a `Pronósticos Especiales`, `Pago pendiente de confirmación` y `predicciones de 6 puntos`.
- `src/components/account/AccountDashboardClient.tsx` conserva `Pronósticos Especiales`.
- `src/components/rules/RulesAccordion.tsx` conserva una referencia a `6 puntos` como criterio textual.

No se tocaron esos componentes visuales en esta auditoría por restricción explícita de alcance.

## API/backend

### Predicciones

- `src/app/api/predictions/me/route.ts` usa `getOfficialPrediction`.
- `src/lib/server/predictions.ts` define:
  - `CURRENT_PREDICTION_STAGE = "group_stage"`
  - `CURRENT_STAGE_TOTAL_MATCHES = 72`
  - `save-match` y `sync-draft` validan que el partido sea `stage = GROUP`.
  - `GET /api/predictions/me` devuelve progreso de fase de grupos, no 104.

Hallazgo corregido:

- `src/lib/worldcup/matches.ts#getMatches()` todavía leía todos los partidos de `matches`, incluyendo eliminatorias.
- Eso podía alimentar `/mi-prediccion` con 104 partidos aunque los endpoints oficiales ya estuvieran limitados a 72.
- Se corrigió para que `getMatches()` devuelva solo `stage = GROUP` en la etapa actual.

### Pagos/status

- `GET /api/payments/status` lee `user_participation` y `payments`; no crea payments pending.
- `status` calcula:
  - `isActive`
  - `canStartPayment`
- `pending_payment` sigue siendo un dato interno del registro de participación. Las referencias visibles detectadas están en componentes frontend, no en una mutación del endpoint de status.

### Scoring

- `src/lib/server/scoring.ts` usa constantes oficiales:
  - marcador exacto: 5
  - tendencia + diferencia: 4
  - solo tendencia: 3
  - incorrecto: 0

No se detectaron constantes backend `6/3/2/10` para scoring oficial.

### Prize pool

- `src/app/api/public/prize-pool/route.ts` calcula participantes activos desde `user_participation` con `status = active`, `paid = true`, `payment_status = approved`.
- Usa helper `calculatePrizePool` con base visual de participantes y dólar blue/fallback.

## Nombres de equipos

- `src/lib/worldcup/team-display-names.ts` ya cubría la mayoría de alias pedidos:
  - Corea del Sur
  - Sudáfrica
  - Estados Unidos
  - Arabia Saudita
  - Costa de Marfil
  - Cabo Verde
  - Chequia
  - Inglaterra
  - Alemania
  - Países Bajos
  - Nueva Zelanda
  - Marruecos
  - Egipto
  - Túnez
  - Argelia
  - Irak
  - Irán
- Se agregó/corroboró `Norway -> Noruega` y `Wales -> Gales`.

## Correcciones hechas

- `src/lib/worldcup/matches.ts`
  - `getMatches()` ahora filtra `stage = GROUP`, blindando `/mi-prediccion` para etapa actual.

## Pendientes fuera de alcance de esta auditoría

- Limpiar textos visuales viejos en `PremiosClient`, `AccountDashboardClient`, `PredictionForm` y `RulesAccordion`.
- Confirmar en Vercel que el deploy activo apunta al último `origin/main`.
- Si producción sigue mostrando versión vieja después del push, forzar redeploy de `origin/main` y revisar build cache.
