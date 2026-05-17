# WC2026 API sync report

- Fecha: 2026-05-17T18:50:59.396Z
- Fuente principal: WC2026 API
- Key detectada: si
- Service role presente: no
- Escritura en Supabase: no, solo cache/CSV/reporte

## Datos obtenidos

- Teams obtenidos: 48
- Groups obtenidos: 12
- Matches obtenidos: 104
- Stadiums obtenidos: 17

## Matching

- Teams matched con Supabase: 48
- Teams unmatched: 0
- Teams ambiguous: 0
- Matches matched con Supabase: 104
- Matches unmatched: 0
- Matches ambiguous: 0
- Stadiums procesados: 17

## Escritura

- Teams actualizados: 0
- Matches actualizados: 0
- Falta SUPABASE_SERVICE_ROLE_KEY: si

## Archivos generados

- `supabase/import/api-cache/wc2026api/teams.json`
- `supabase/import/api-cache/wc2026api/groups.json`
- `supabase/import/api-cache/wc2026api/matches.json`
- `supabase/import/api-cache/wc2026api/stadiums.json`
- `supabase/import/wc2026api_teams_review.csv`
- `supabase/import/wc2026api_groups_review.csv`
- `supabase/import/wc2026api_matches_review.csv`
- `supabase/import/wc2026api_stadiums_review.csv`

## Limitaciones

- WC2026 API no provee endpoint de jugadores.
- Jugadores quedan en `players_info` con el estado actual, incluyendo `pending_review`.
- No trae fotos de jugadores.
- No trae escudos/logos.
- `flag_url` existe, pero actualmente viene vacio para los 48 equipos.
- Se mantienen placeholders premium y Storage como fallback visual.

## Errores

- Sin errores.
