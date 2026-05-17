# API-Football debug report

- Fecha: 2026-05-17
- Proyecto: Mi Prediccion Mundial 2026
- Fuente probada: API-Football / API-SPORTS
- Base URL: `https://v3.football.api-sports.io`
- Parametros probados: `league=1`, `season=2026`
- API key detectada: si
- API key longitud: 32
- API key preview: `3b1d...3631`

## Endpoints probados

| Endpoint | Archivo debug | errors | results | response |
| --- | --- | --- | ---: | ---: |
| `/status` | `supabase/import/api-cache/worldcup-2026/debug-status.json` | `[]` | 0 | objeto status |
| `/leagues?id=1&season=2026` | `supabase/import/api-cache/worldcup-2026/debug-league.json` | `Free plans do not have access to this season, try from 2022 to 2024.` | 0 | 0 |
| `/teams?league=1&season=2026` | `supabase/import/api-cache/worldcup-2026/debug-teams.json` | `Free plans do not have access to this season, try from 2022 to 2024.` | 0 | 0 |
| `/fixtures?league=1&season=2026` | `supabase/import/api-cache/worldcup-2026/debug-fixtures.json` | `Free plans do not have access to this season, try from 2022 to 2024.` | 0 | 0 |
| `/fixtures/rounds?league=1&season=2026` | `supabase/import/api-cache/worldcup-2026/debug-rounds.json` | `Free plans do not have access to this season, try from 2022 to 2024.` | 0 | 0 |

## Status de cuenta

- La key funciona: si.
- Plan: Free.
- Suscripcion activa: si.
- Limite diario informado: 100 requests.
- Requests usados al momento del status: 0.

## Lectura tecnica

La API directa tambien devuelve 0 datos. No es un bug de `scripts/sync-worldcup-2026-from-api.ts` ni de headers ni de URL base.

El bloqueo viene de API-Football: el plan Free no permite consultar `season=2026`. La propia API informa que para Free solo permite seasons 2022 a 2024.

## Conclusion

- `league=1&season=2026` existe como criterio documentado, pero esta key Free no tiene acceso a esa temporada.
- `teams`, `fixtures`, `standings` y `rounds` devuelven 0 por restriccion de plan.
- No hay datos reales que importar desde API-Football 2026 con esta key Free.

## Proximo paso

1. Usar una key/plan de API-Football con acceso a season 2026.
2. Volver a correr `~/.bun/bin/bun run api:sync-worldcup-2026`.
3. Si el plan habilita 2026, el script debe poblar cache, CSVs y reportes.
4. Para escribir en Supabase/Storage tambien falta `SUPABASE_SERVICE_ROLE_KEY`.
