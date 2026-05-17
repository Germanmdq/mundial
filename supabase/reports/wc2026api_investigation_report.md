# WC2026 API investigation report

- Fecha: 2026-05-17
- Base URL probada: `https://api.wc2026api.com`
- Auth esperado: `Authorization: Bearer <WC2026_API_KEY>`
- Key detectada: si
- Key usada en esta prueba: placeholder (`PEGAR_..._ACA`), no una key real valida.

## Docs / OpenAPI

- `/docs` carga: si, HTTP 200.
- Swagger UI encontrado: si.
- OpenAPI directo `/openapi.json`: no sirve, devuelve objeto de error sin `paths`.
- Swagger directo `/swagger.json`: no sirve, devuelve objeto de error sin `paths`.
- `/docs-json`: no sirve, devuelve objeto de error sin `paths`.
- `/api-docs`: no sirve, devuelve objeto de error sin `paths`.
- OpenAPI real usado por Swagger UI: `/docs/json`.
- Titulo: `WC2026 API`
- Version: `1.0.0`
- Paths encontrados: 10.

## Endpoints encontrados

- `/teams`: GET
- `/teams/{id}`: GET
- `/groups`: GET
- `/groups/{id}`: GET
- `/matches`: GET
- `/matches/{id}`: GET
- `/stadiums`: GET
- `/stadiums/{id}`: GET
- `/webhooks`: POST, GET, DELETE
- `/test/match`: GET

## Endpoints probados con Bearer

| Endpoint | Archivo | Resultado |
| --- | --- | --- |
| `/teams` | `supabase/import/api-cache/wc2026api/debug-teams.json` | `Invalid or expired API key` |
| `/matches` | `supabase/import/api-cache/wc2026api/debug-matches.json` | `Invalid or expired API key` |
| `/groups` | `supabase/import/api-cache/wc2026api/debug-groups.json` | `Invalid or expired API key` |
| `/stadiums` | `supabase/import/api-cache/wc2026api/debug-stadiums.json` | `Invalid or expired API key` |
| `/standings` | `supabase/import/api-cache/wc2026api/debug-standings.json` | `Route GET:/standings not found` |
| `/players` | `supabase/import/api-cache/wc2026api/debug-players.json` | `Route GET:/players not found` |

## Cantidades verificadas con esta key

Como la key actual es placeholder/no valida, los endpoints protegidos no devuelven datos reales.

- Equipos devueltos: 0
- Partidos devueltos: 0
- Grupos devueltos: 0
- Standings devueltos: 0
- Estadios devueltos: 0
- Jugadores devueltos: 0

## Capacidades inferidas desde OpenAPI

- Equipos: si. El summary de `/teams` dice `List all 48 teams`.
- Partidos: si. `/matches` lista partidos y acepta filtros `group`, `round`, `status`, `team`.
- Grupos: si. `/groups` lista los 12 grupos con equipos.
- Standings: parcialmente. No existe `/standings`, pero `/groups/{id}` dice que devuelve un grupo con standings.
- Estadios: si. `/stadiums` lista estadios sede.
- Jugadores: no hay endpoint documentado `/players`.
- Escudos/logos: no verificable sin respuesta real; OpenAPI no expone schemas.
- Flags: no verificable sin respuesta real; OpenAPI no expone schemas.
- Fotos de jugadores: improbable/no documentado, porque no hay endpoint de jugadores.
- 48 equipos: prometido por docs de `/teams`, no confirmado con key invalida.
- 104 partidos: no confirmado con key invalida.

## Recomendacion

Sirve parcialmente si conseguimos una key real valida:

- Puede servir como fuente principal para equipos, grupos, partidos y estadios.
- Puede reemplazar API-Football para fixture/grupos si `/matches` devuelve los 104 partidos reales con campos completos.
- No alcanza para jugadores ni fotos de jugadores porque no hay endpoint `/players` documentado.
- No se puede confirmar assets de equipos hasta probar `/teams` con key real.

## Proximo paso

1. Reemplazar `WC2026_API_KEY=PEGAR_KEY_WC2026_ACA` por una key real.
2. Repetir las pruebas de `/teams`, `/matches`, `/groups` y `/stadiums`.
3. Si devuelve 48 equipos y 104 partidos, crear sync separado para WC2026 API.
4. Mantener API-Football/TheSportsDB o fuente alternativa para jugadores, escudos y fotos si WC2026 API no los trae.

## Prueba con key real

- Fecha: 2026-05-17
- Key detectada: si
- Key preview: `wc26_7...7rKo`
- Auth Bearer funciono: si

### Cantidades

- `/teams`: 48 equipos
- `/groups`: 12 grupos
- `/matches`: 104 partidos
- `/stadiums`: 17 estadios

### Verificaciones

- Trae 48 equipos: si
- Trae 104 partidos: si
- Trae grupos: si
- Trae estadios: si
- Rondas en matches: `3rd, QF, R16, R32, SF, final, group`
- Estados en matches: `scheduled`

### Campos de datos

- Teams fields: `id`, `name`, `code`, `flag_url`, `group_name`
- Matches fields principales: `id`, `match_number`, `round`, `group_name`, `home_team_id`, `home_team`, `home_team_code`, `away_team_id`, `away_team`, `away_team_code`, `stadium_id`, `stadium`, `stadium_city`, `stadium_country`, `kickoff_utc`, `status`, scores y penales.
- Groups fields: `id`, `name`, `teams`
- Stadiums fields: `id`, `name`, `city`, `country`, `capacity`

### Assets / imagenes

- Trae campo `flag_url` en teams: si
- Flags no null en teams: 0 de 48
- Flags no null en matches: 0 de 104 partidos con algun flag
- Trae logos/escudos: no detectado
- Trae fotos de jugadores: no
- Trae imagenes de estadios: no

### Jugadores

- Endpoint `/players`: no existe en OpenAPI y en la prueba anterior devolvio `Route GET:/players not found`.
- WC2026 API no sirve como fuente de jugadores/fotos de jugadores.

### Recomendacion actualizada

Integrar WC2026 API para equipos, grupos, fixture y estadios. Sirve mejor que API-Football Free para datos oficiales del Mundial 2026 porque devuelve 48 equipos, 12 grupos, 104 partidos y 17 estadios con la key real.

No alcanza como fuente unica del producto: faltan jugadores, fotos de jugadores, escudos/logos reales y flags pobladas. Para eso mantener pipeline separado con Storage/placeholders y otra fuente aprobada.

