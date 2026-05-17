# Missing assets sources report

## Resumen

- WC2026 API cubre equipos, grupos, partidos y estadios.
- Faltaban banderas, escudos/logos, jugadores/planteles y fotos de jugadores.
- Service role presente: si.

## Supabase sync

- Teams actualizados: 48
- Matches actualizados: 72

## Flags - FlagCDN / Flagpedia

- Fuente usada: FlagCDN / Flagpedia.
- Registros CSV: 48
- Flags descargadas: 48
- Flags subidas a Supabase: 48
- Team assets actualizados: 48
- Flags public locales: 48
- Missing ISO code: 0
- CSV: `supabase/import/team_country_codes_review.csv`

## Badges / escudos - TheSportsDB

- Fuente configurada: TheSportsDB.
- Requiere key: `THESPORTSDB_API_KEY`.
- Badges encontrados: 0
- Badges descargados: 0
- Badges subidos a Supabase: 0
- CSV: `supabase/import/thesportsdb_team_badges_review.csv`

## Jugadores - Wikipedia squads

- Fuente usada: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads
- Jugadores encontrados: 621
- Estados: {'pending_review': 596, 'matched_pending_review': 25}
- Updates Supabase pending_review: 0
- Nuevos no insertados para evitar duplicados sin constraint validado: 595
- No se marcaron jugadores como `confirmed`.
- CSV: `supabase/import/wikipedia_worldcup_players_review.csv`

## Fotos de jugadores - Wikimedia Commons

- Fuente usada: Wikidata P18 + Wikimedia Commons.
- Jugadores revisados: 621
- Fotos encontradas/descargadas: 5
- Fotos locales public WebP: 7
- Fotos subidas a Supabase: 1
- Errores: 2
- Sin imagen: 614
- CSV: `supabase/import/wikimedia_player_photos_review.csv`

## Fotos de jugadores - TheSportsDB

- Fuente configurada: TheSportsDB.
- Requiere key: `THESPORTSDB_API_KEY`.
- CSV: `supabase/import/thesportsdb_player_photos_review.csv`

## Limitaciones y proximos pasos

- TheSportsDB no se ejecuto con datos porque falta `THESPORTSDB_API_KEY`.
- Wikimedia encontro pocas fotos automaticas; las demas quedan con placeholders premium.
- Los jugadores de Wikipedia quedan para revision, no como plantel oficial confirmado.
- Para insertar nuevos jugadores masivamente conviene agregar o confirmar un constraint unico en `players_info(team_id, slug)` o un flujo admin de deduplicacion.
