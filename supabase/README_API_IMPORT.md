# Import por APIs externas

Este flujo reemplaza al PDF Panini. La fuente principal del proyecto es API-Football para Mundial 2026.

## Variables

```env
API_FOOTBALL_KEY=
THESPORTSDB_API_KEY=
FOOTBALL_DATA_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` se usa solo en scripts admin locales. Nunca va al frontend.

TheSportsDB puede usar la key publica de prueba para pruebas, pero produccion necesita key propia.

## Comandos

```bash
~/.bun/bin/bun run api:sync-worldcup-2026
~/.bun/bin/bun run api:search-teams
~/.bun/bin/bun run api:import-team-logos
~/.bun/bin/bun run api:import-squads
~/.bun/bin/bun run api:import-player-photos
```

## Mundial 2026 - Fuente principal

Parametros oficiales del sync principal:

```txt
league=1
season=2026
```

Variables necesarias:

```env
API_FOOTBALL_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Variables opcionales:

```env
THESPORTSDB_API_KEY=
FOOTBALL_DATA_API_KEY=
```

Comando principal:

```bash
~/.bun/bin/bun run api:sync-worldcup-2026
```

Flujo recomendado:

1. Cargar `API_FOOTBALL_KEY`.
2. Correr `api:sync-worldcup-2026`.
3. Revisar los CSV generados en `supabase/import/`.
4. Si esta todo bien, agregar `SUPABASE_SERVICE_ROLE_KEY`.
5. Correr `api:sync-worldcup-2026` otra vez para subir assets y actualizar Supabase.
6. Verificar `/equipos` y `/jugadores`.

El script guarda respuestas crudas en `supabase/import/api-cache/worldcup-2026/` y genera:

- `supabase/import/api_worldcup_teams_review.csv`
- `supabase/import/api_worldcup_matches_review.csv`
- `supabase/import/api_worldcup_players_review.csv`
- `supabase/reports/worldcup_2026_api_sync_report.md`

## Flujo

Este flujo manual queda como soporte para busquedas puntuales o imports por provider, pero no es la fuente principal.

1. Completar `supabase/import/team_search_input.csv`.
2. Correr `api:search-teams`.
3. Revisar `supabase/import/team_search_results.csv`.
4. Completar `supabase/import/external_team_mappings.csv`.
5. Importar logos con `api:import-team-logos`.
6. Importar squads con `api:import-squads`.
7. Revisar `supabase/import/api_players_review.csv`.
8. Importar fotos con `api:import-player-photos`.
9. Revisar `/equipos` y `/jugadores`.

## Reglas

- No se crean duplicados si hay match fuerte.
- Los jugadores importados quedan `pending_review`.
- No se marca `confirmed` automaticamente.
- No se usa Panini/PDF como fuente de datos.
- Si falta service role, se preparan archivos locales cuando sea posible, pero no se sube Storage ni se actualiza DB.
- Si faltan API keys, los scripts generan salidas vacias o reportes claros sin stacktrace inutil.
