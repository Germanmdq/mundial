# WC2026 API sync report

- Fecha: 2026-05-17T19:22:38.903Z
- Fuente principal: WC2026 API
- Key detectada: si
- Service role presente: si
- Escritura en Supabase: si

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

- Teams actualizados: 48
- Matches actualizados: 72
- Falta SUPABASE_SERVICE_ROLE_KEY: no

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

- matches 73: {"code":"23502","details":"Failing row contains (73, R32, null, 2026-06-28 19:00:00+00, Inglewood, CA, null, null, 2026-05-15 18:49:25.951443+00, 73, Ronda de 32, null, null, null, null, Segundo Grupo A, Segundo Grupo B, null, null, Segundo Grupo A, Segundo Grupo B, USA, SoFi Stadium, 73, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 76: {"code":"23502","details":"Failing row contains (76, R32, null, 2026-06-29 17:00:00+00, Houston, TX, null, null, 2026-05-15 18:49:25.951443+00, 76, Ronda de 32, null, null, null, null, Primero Grupo C, Segundo Grupo F, null, null, Primero Grupo C, Segundo Grupo F, USA, NRG Stadium, 76, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 74: {"code":"23502","details":"Failing row contains (74, R32, null, 2026-06-29 20:30:00+00, Foxborough, MA, null, null, 2026-05-15 18:49:25.951443+00, 74, Ronda de 32, null, null, null, null, Primero Grupo E, Tercero Grupo A/B/C/D/F, null, null, Primero Grupo E, Tercero Grupo A/B/C/D/F, USA, Gillette Stadium, 74, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 75: {"code":"23502","details":"Failing row contains (75, R32, null, 2026-06-30 01:00:00+00, Monterrey, null, null, 2026-05-15 18:49:25.951443+00, 75, Ronda de 32, null, null, null, null, Primero Grupo F, Segundo Grupo C, null, null, Primero Grupo F, Segundo Grupo C, Mexico, Estadio BBVA, 75, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 78: {"code":"23502","details":"Failing row contains (78, R32, null, 2026-06-30 17:00:00+00, Arlington, TX, null, null, 2026-05-15 18:49:25.951443+00, 78, Ronda de 32, null, null, null, null, Segundo Grupo E, Segundo Grupo I, null, null, Segundo Grupo E, Segundo Grupo I, USA, AT&T Stadium, 78, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 77: {"code":"23502","details":"Failing row contains (77, R32, null, 2026-06-30 21:00:00+00, East Rutherford, NJ, null, null, 2026-05-15 18:49:25.951443+00, 77, Ronda de 32, null, null, null, null, Primero Grupo I, Tercero Grupo C/D/F/G/H, null, null, Primero Grupo I, Tercero Grupo C/D/F/G/H, USA, MetLife Stadium, 77, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 79: {"code":"23502","details":"Failing row contains (79, R32, null, 2026-07-01 01:00:00+00, Mexico City, null, null, 2026-05-15 18:49:25.951443+00, 79, Ronda de 32, null, null, null, null, Primero Grupo A, Tercero Grupo C/E/F/H/I, null, null, Primero Grupo A, Tercero Grupo C/E/F/H/I, Mexico, Estadio Azteca, 79, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 80: {"code":"23502","details":"Failing row contains (80, R32, null, 2026-07-01 16:00:00+00, Atlanta, GA, null, null, 2026-05-15 18:49:25.951443+00, 80, Ronda de 32, null, null, null, null, Primero Grupo L, Tercero Grupo E/H/I/J/K, null, null, Primero Grupo L, Tercero Grupo E/H/I/J/K, USA, Mercedes-Benz Stadium, 80, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 82: {"code":"23502","details":"Failing row contains (82, R32, null, 2026-07-01 20:00:00+00, Seattle, WA, null, null, 2026-05-15 18:49:25.951443+00, 82, Ronda de 32, null, null, null, null, Primero Grupo G, Tercero Grupo A/E/H/I/J, null, null, Primero Grupo G, Tercero Grupo A/E/H/I/J, USA, Lumen Field, 82, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 81: {"code":"23502","details":"Failing row contains (81, R32, null, 2026-07-02 00:00:00+00, Santa Clara, CA, null, null, 2026-05-15 18:49:25.951443+00, 81, Ronda de 32, null, null, null, null, Primero Grupo D, Tercero Grupo B/E/F/I/J, null, null, Primero Grupo D, Tercero Grupo B/E/F/I/J, USA, Levi's Stadium, 81, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 84: {"code":"23502","details":"Failing row contains (84, R32, null, 2026-07-02 19:00:00+00, Inglewood, CA, null, null, 2026-05-15 18:49:25.951443+00, 84, Ronda de 32, null, null, null, null, Primero Grupo H, Segundo Grupo J, null, null, Primero Grupo H, Segundo Grupo J, USA, SoFi Stadium, 84, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 83: {"code":"23502","details":"Failing row contains (83, R32, null, 2026-07-02 23:00:00+00, Toronto, ON, null, null, 2026-05-15 18:49:25.951443+00, 83, Ronda de 32, null, null, null, null, Segundo Grupo K, Segundo Grupo L, null, null, Segundo Grupo K, Segundo Grupo L, Canada, BMO Field, 83, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 85: {"code":"23502","details":"Failing row contains (85, R32, null, 2026-07-03 03:00:00+00, Vancouver, BC, null, null, 2026-05-15 18:49:25.951443+00, 85, Ronda de 32, null, null, null, null, Primero Grupo B, Tercero Grupo E/F/G/I/J, null, null, Primero Grupo B, Tercero Grupo E/F/G/I/J, Canada, BC Place, 85, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 88: {"code":"23502","details":"Failing row contains (88, R32, null, 2026-07-03 18:00:00+00, Arlington, TX, null, null, 2026-05-15 18:49:25.951443+00, 88, Ronda de 32, null, null, null, null, Segundo Grupo D, Segundo Grupo G, null, null, Segundo Grupo D, Segundo Grupo G, USA, AT&T Stadium, 88, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 86: {"code":"23502","details":"Failing row contains (86, R32, null, 2026-07-03 22:00:00+00, Miami Gardens, FL, null, null, 2026-05-15 18:49:25.951443+00, 86, Ronda de 32, null, null, null, null, Primero Grupo J, Segundo Grupo H, null, null, Primero Grupo J, Segundo Grupo H, USA, Hard Rock Stadium, 86, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 87: {"code":"23502","details":"Failing row contains (87, R32, null, 2026-07-04 01:30:00+00, Kansas City, MO, null, null, 2026-05-15 18:49:25.951443+00, 87, Ronda de 32, null, null, null, null, Primero Grupo K, Tercero Grupo D/E/I/J/L, null, null, Primero Grupo K, Tercero Grupo D/E/I/J/L, USA, Arrowhead Stadium, 87, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 90: {"code":"23502","details":"Failing row contains (90, R16, null, 2026-07-04 17:00:00+00, Houston, TX, null, null, 2026-05-15 18:49:25.951443+00, 90, Octavos de final, null, null, null, null, Ganador Partido 73, Ganador Partido 75, null, null, Ganador Partido 73, Ganador Partido 75, USA, NRG Stadium, 90, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 89: {"code":"23502","details":"Failing row contains (89, R16, null, 2026-07-04 21:00:00+00, Philadelphia, PA, null, null, 2026-05-15 18:49:25.951443+00, 89, Octavos de final, null, null, null, null, Ganador Partido 74, Ganador Partido 77, null, null, Ganador Partido 74, Ganador Partido 77, USA, Lincoln Financial Field, 89, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 91: {"code":"23502","details":"Failing row contains (91, R16, null, 2026-07-05 20:00:00+00, East Rutherford, NJ, null, null, 2026-05-15 18:49:25.951443+00, 91, Octavos de final, null, null, null, null, Ganador Partido 76, Ganador Partido 78, null, null, Ganador Partido 76, Ganador Partido 78, USA, MetLife Stadium, 91, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 92: {"code":"23502","details":"Failing row contains (92, R16, null, 2026-07-06 00:00:00+00, Mexico City, null, null, 2026-05-15 18:49:25.951443+00, 92, Octavos de final, null, null, null, null, Ganador Partido 79, Ganador Partido 80, null, null, Ganador Partido 79, Ganador Partido 80, Mexico, Estadio Azteca, 92, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 93: {"code":"23502","details":"Failing row contains (93, R16, null, 2026-07-06 19:00:00+00, Arlington, TX, null, null, 2026-05-15 18:49:25.951443+00, 93, Octavos de final, null, null, null, null, Ganador Partido 83, Ganador Partido 84, null, null, Ganador Partido 83, Ganador Partido 84, USA, AT&T Stadium, 93, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 94: {"code":"23502","details":"Failing row contains (94, R16, null, 2026-07-07 00:00:00+00, Seattle, WA, null, null, 2026-05-15 18:49:25.951443+00, 94, Octavos de final, null, null, null, null, Ganador Partido 81, Ganador Partido 82, null, null, Ganador Partido 81, Ganador Partido 82, USA, Lumen Field, 94, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 95: {"code":"23502","details":"Failing row contains (95, R16, null, 2026-07-07 16:00:00+00, Atlanta, GA, null, null, 2026-05-15 18:49:25.951443+00, 95, Octavos de final, null, null, null, null, Ganador Partido 86, Ganador Partido 88, null, null, Ganador Partido 86, Ganador Partido 88, USA, Mercedes-Benz Stadium, 95, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 96: {"code":"23502","details":"Failing row contains (96, R16, null, 2026-07-07 20:00:00+00, Vancouver, BC, null, null, 2026-05-15 18:49:25.951443+00, 96, Octavos de final, null, null, null, null, Ganador Partido 85, Ganador Partido 87, null, null, Ganador Partido 85, Ganador Partido 87, Canada, BC Place, 96, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 97: {"code":"23502","details":"Failing row contains (97, QF, null, 2026-07-09 20:00:00+00, Foxborough, MA, null, null, 2026-05-15 18:49:25.951443+00, 97, Cuartos de final, null, null, null, null, Ganador Partido 89, Ganador Partido 90, null, null, Ganador Partido 89, Ganador Partido 90, USA, Gillette Stadium, 97, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 98: {"code":"23502","details":"Failing row contains (98, QF, null, 2026-07-10 19:00:00+00, Inglewood, CA, null, null, 2026-05-15 18:49:25.951443+00, 98, Cuartos de final, null, null, null, null, Ganador Partido 93, Ganador Partido 94, null, null, Ganador Partido 93, Ganador Partido 94, USA, SoFi Stadium, 98, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 99: {"code":"23502","details":"Failing row contains (99, QF, null, 2026-07-11 21:00:00+00, Miami Gardens, FL, null, null, 2026-05-15 18:49:25.951443+00, 99, Cuartos de final, null, null, null, null, Ganador Partido 91, Ganador Partido 92, null, null, Ganador Partido 91, Ganador Partido 92, USA, Hard Rock Stadium, 99, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 100: {"code":"23502","details":"Failing row contains (100, QF, null, 2026-07-12 01:00:00+00, Kansas City, MO, null, null, 2026-05-15 18:49:25.951443+00, 100, Cuartos de final, null, null, null, null, Ganador Partido 95, Ganador Partido 96, null, null, Ganador Partido 95, Ganador Partido 96, USA, Arrowhead Stadium, 100, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 101: {"code":"23502","details":"Failing row contains (101, SF, null, 2026-07-14 19:00:00+00, Arlington, TX, null, null, 2026-05-15 18:49:25.951443+00, 101, Semifinal, null, null, null, null, Ganador Partido 97, Ganador Partido 98, null, null, Ganador Partido 97, Ganador Partido 98, USA, AT&T Stadium, 101, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 102: {"code":"23502","details":"Failing row contains (102, SF, null, 2026-07-15 19:00:00+00, Atlanta, GA, null, null, 2026-05-15 18:49:25.951443+00, 102, Semifinal, null, null, null, null, Ganador Partido 99, Ganador Partido 100, null, null, Ganador Partido 99, Ganador Partido 100, USA, Mercedes-Benz Stadium, 102, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 103: {"code":"23502","details":"Failing row contains (103, 3rd, null, 2026-07-18 21:00:00+00, Miami Gardens, FL, null, null, 2026-05-15 18:49:25.951443+00, 103, Tercer puesto, null, null, null, null, Perdedor Partido 101, Perdedor Partido 102, null, null, Perdedor Partido 101, Perdedor Partido 102, USA, Hard Rock Stadium, 103, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
- matches 104: {"code":"23502","details":"Failing row contains (104, final, null, 2026-07-19 19:00:00+00, East Rutherford, NJ, null, null, 2026-05-15 18:49:25.951443+00, 104, Final, null, null, null, null, Ganador Partido 101, Ganador Partido 102, null, null, Ganador Partido 101, Ganador Partido 102, USA, MetLife Stadium, 104, t).","hint":null,"message":"null value in column \"home_team\" of relation \"matches\" violates not-null constraint"}
