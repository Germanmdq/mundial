# Assets y jugadores: estado actual

Fecha de auditoria: 2026-05-17T15:44:01.642Z

## Supabase

- Proyecto: djidlwumazwuwkedkbmu
- Lectura usada: anon key read-only desde `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY`: no detectada en `.env.local`; no se puede subir Storage ni escribir tablas desde scripts admin todavia.

## Equipos y assets

- Equipos en `teams_info`: 48
- Registros en `team_assets`: 192
- Assets esperados por tipo: 48
- Assets esperados totales: 192

| asset_type | registros DB | faltantes DB vs 48 |
| --- | ---: | ---: |
| flag | 48 | 0 |
| crest | 48 | 0 |
| hero_image | 48 | 0 |
| background | 48 | 0 |

## Storage worldcup-assets

- Archivos/carpetas listados en raiz del bucket: 0
- Archivos fisicos esperados para equipos: 192
- Archivos fisicos faltantes estimados: 192

El bucket existe pero la raiz no devuelve archivos/carpetas. Operativamente se considera Storage pendiente hasta correr `assets:sync-teams` con archivos locales reales y service role.

## Jugadores

- Jugadores en `players_info`: 718
- Jugadores sin `source_url`: 718
- Jugadores sin foto (`photo_url`, `photo_path` o `photo_storage_path`): 718

| status | cantidad |
| --- | ---: |
| pending_review | 718 |

## Jugadores por equipo

| equipo | slug | jugadores |
| --- | --- | ---: |
| Algeria | algeria | 0 |
| Argentina | argentina | 7 |
| Australia | australia | 11 |
| Austria | austria | 14 |
| Belgium | belgium | 0 |
| Bosnia and Herzegovina | bosnia-and-herzegovina | 0 |
| Brazil | brazil | 0 |
| Canada | canada | 0 |
| Cape Verde | cape-verde | 0 |
| Colombia | colombia | 4 |
| Croatia | croatia | 0 |
| Curacao | curacao | 0 |
| Czechia | czechia | 0 |
| DR Congo | dr-congo | 0 |
| Ecuador | ecuador | 5 |
| Egypt | egypt | 0 |
| England | england | 0 |
| France | france | 0 |
| Germany | germany | 0 |
| Ghana | ghana | 31 |
| Haiti | haiti | 31 |
| Iran | iran | 86 |
| Iraq | iraq | 0 |
| Ivory Coast | ivory-coast | 0 |
| Japan | japan | 0 |
| Jordan | jordan | 0 |
| Mexico | mexico | 46 |
| Morocco | morocco | 0 |
| Netherlands | netherlands | 0 |
| New Zealand | new-zealand | 0 |
| Norway | norway | 0 |
| Panama | panama | 92 |
| Paraguay | paraguay | 47 |
| Portugal | portugal | 29 |
| Qatar | qatar | 75 |
| Saudi Arabia | saudi-arabia | 0 |
| Scotland | scotland | 0 |
| Senegal | senegal | 112 |
| South Africa | south-africa | 0 |
| South Korea | south-korea | 0 |
| Spain | spain | 0 |
| Sweden | sweden | 0 |
| Switzerland | switzerland | 0 |
| Tunisia | tunisia | 0 |
| Turkey | turkey | 0 |
| United States | united-states | 0 |
| Uruguay | uruguay | 77 |
| Uzbekistan | uzbekistan | 51 |

## Equipos sin jugadores

- Algeria (algeria)
- Belgium (belgium)
- Bosnia and Herzegovina (bosnia-and-herzegovina)
- Brazil (brazil)
- Canada (canada)
- Cape Verde (cape-verde)
- Croatia (croatia)
- Curacao (curacao)
- Czechia (czechia)
- DR Congo (dr-congo)
- Egypt (egypt)
- England (england)
- France (france)
- Germany (germany)
- Iraq (iraq)
- Ivory Coast (ivory-coast)
- Japan (japan)
- Jordan (jordan)
- Morocco (morocco)
- Netherlands (netherlands)
- New Zealand (new-zealand)
- Norway (norway)
- Saudi Arabia (saudi-arabia)
- Scotland (scotland)
- South Africa (south-africa)
- South Korea (south-korea)
- Spain (spain)
- Sweden (sweden)
- Switzerland (switzerland)
- Tunisia (tunisia)
- Turkey (turkey)
- United States (united-states)

## Conclusion operativa

- La base tiene 48 equipos canonicos y 192 registros de assets en DB.
- Faltan los archivos fisicos reales de Storage para flags, crests, hero y background.
- Hay 718 jugadores cargados, todos deben permanecer en revision mientras falten fuente y fecha de verificacion.
- El frontend debe usar placeholders premium cuando falten imagenes y no debe afirmar “plantel oficial”.
- Para subir assets reales falta colocar archivos locales bajo `assets/worldcup-assets/` y configurar `SUPABASE_SERVICE_ROLE_KEY` solo para scripts admin.
