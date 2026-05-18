# Final Teams and Matches Audit Report

Fecha: 2026-05-18

## Alcance

Auditoría final de datos del Mundial 2026 antes del lanzamiento:

- Equipos y grupos.
- Nombres visibles en castellano.
- Fixture completo.
- Fase de grupos usada por `/mi-prediccion`.

No se tocaron pagos, schema, Home visual, Header, premios visuales, scoring, favicon ni metadata.

## Tablas reales

La tabla solicitada `teams` no está disponible en el schema cache de PostgREST. La tabla real usada por la app para selecciones es:

- `teams_info`

Tablas auditadas:

- `teams_info`
- `matches`
- `prediction_match_scores`

Columnas principales de `teams_info`:

`id`, `name`, `coach`, `captain`, `fifa_ranking`, `group_name`, `summary`, `created_at`, `updated_at`, `slug`, `short_name`, `official_name`, `fifa_code`, `confederation`, `group_letter`, `world_cup_appearances`, `best_world_cup_result`, `primary_color`, `secondary_color`, `status`, `flag_url`, `crest_url`, `hero_image_url`, `display_name_en`, `display_name_es`.

Columnas principales de `matches`:

`id`, `stage`, `group_name`, `kickoff_at`, `city`, `home_team`, `away_team`, `created_at`, `match_number`, `stage_label`, `group_letter`, `matchday`, `home_team_id`, `away_team_id`, `home_placeholder`, `away_placeholder`, `home_origin_match_number`, `away_origin_match_number`, `home_origin_label`, `away_origin_label`, `country`, `stadium_name`, `sort_order`, `is_knockout`.

## Equipos

- Total equipos en `teams_info`: 48.
- Grupos detectados: 12.
- Equipos por grupo:
  - A: 4
  - B: 4
  - C: 4
  - D: 4
  - E: 4
  - F: 4
  - G: 4
  - H: 4
  - I: 4
  - J: 4
  - K: 4
  - L: 4

Validaciones:

- Grupos con cantidad distinta de 4 equipos: 0.
- Equipos sin grupo: 0.
- Códigos FIFA duplicados: 0.
- Slugs duplicados: 0.
- Equipos sin `group_letter`, `fifa_code` o `slug`: 0.

## Partidos

- Total partidos en `matches`: 104.
- Fase de grupos: 72.
- Eliminatorias: 32.

Conteo por `stage`:

- `group`: 72
- `ROUND_OF_32`: 16
- `ROUND_OF_16`: 8
- `QUARTER_FINAL`: 4
- `SEMI_FINAL`: 2
- `THIRD_PLACE`: 1
- `FINAL`: 1

Conteo por `is_knockout`:

- `false`: 72
- `true`: 32

Partidos de fase de grupos por grupo:

- A: 6
- B: 6
- C: 6
- D: 6
- E: 6
- F: 6
- G: 6
- H: 6
- I: 6
- J: 6
- K: 6
- L: 6

Validaciones:

- Grupos con cantidad distinta de 6 partidos: 0.
- Partidos de grupo sin local o visitante: 0.
- Partidos con mismo equipo contra sí mismo: 0.
- Partidos de grupo con equipo inexistente: 0.
- Partidos de grupo con equipos de grupos distintos: 0.
- Partidos duplicados local-visitante: 0.
- Partidos duplicados por par de equipos en fase de grupos: 0.

## Match numbers

- `match_number` mínimo: 1.
- `match_number` máximo: 104.
- `match_number` distintos: 104.
- Partidos con `match_number` null: 0.
- Huecos entre 1 y 104: 0.
- Duplicados de `match_number`: 0.

## Funciones del proyecto

Archivo auditado:

- `src/lib/worldcup/matches.ts`

Resultado equivalente con la misma regla robusta:

- Total raw matches: 104.
- `getMatches()` / fase actual: 72.
- `getGroupMatches()` total esperado: 72.
- `getKnockoutMatches()` esperado: 32.
- Primer partido de fase de grupos: partido 1, Mexico vs South Africa.
- Último partido de fase de grupos: partido 72, Congo DR vs Uzbekistan.

La función no usa `stage = "GROUP"` rígido. Detecta fase de grupos con:

- `is_knockout === false`
- `stage`, `phase`, `round`, `stage_label`, `group_letter` y campos relacionados.
- Fallback a los primeros 72 solo si no se detectara fase de grupos.

## /mi-prediccion

Archivos revisados:

- `src/app/mi-prediccion/page.tsx`
- `src/components/prediction/PredictionScreen.tsx`
- `src/components/prediction/PredictionForm.tsx`

Validaciones:

- La pantalla usa partidos de fase de grupos.
- Total visible esperado: 72.
- No se encontró `104` renderizable en `/mi-prediccion`.
- Se retiraron textos/debug labels que mencionaban `Goleador` o `campeón` dentro de `/mi-prediccion` para mantener fase 1 limpia.
- Las etapas posteriores quedan descritas de forma genérica como “etapas siguientes”.

## Nombres en castellano

Archivo revisado:

- `src/lib/worldcup/team-display-names.ts`

Confirmado uso de `getTeamDisplayName()` en:

- `/equipos`: `EquiposClient`, `TeamCard`.
- `/mi-prediccion`: `PredictionMatchCard`, `PredictionForm`.
- Resumen de predicciones: `PredictionForm`.
- Jugadores: `JugadoresClient`.
- Selectores/cards de equipos: `TeamSelectCard`.

Mapeos confirmados:

- Norway -> Noruega
- South Korea / Korea Republic -> Corea del Sur
- South Africa -> Sudáfrica
- United States -> Estados Unidos
- Saudi Arabia -> Arabia Saudita
- Ivory Coast / Côte d'Ivoire -> Costa de Marfil
- Cape Verde -> Cabo Verde
- Czechia -> Chequia
- England -> Inglaterra
- Germany -> Alemania
- Netherlands -> Países Bajos
- New Zealand -> Nueva Zelanda
- Morocco -> Marruecos
- Egypt -> Egipto
- Tunisia -> Túnez
- Algeria -> Argelia
- Iraq -> Irak
- Iran -> Irán
- Scotland -> Escocia
- Wales -> Gales
- Switzerland -> Suiza

Corrección aplicada:

- `Congo DR`, `DR Congo` y `Democratic Republic of the Congo` ahora se muestran como `RD Congo`.
- Se agregó bandera `🇨🇩` para esas variantes.

## Resultado final

- Equipos: correcto.
- Grupos: correcto.
- Fixture: correcto.
- Fase de grupos: correcto.
- Eliminatorias: presentes como 32 partidos, no usadas en fase 1 de predicción.
- Nombres en castellano: helper confirmado y una variante faltante corregida.

## Archivos tocados

- `src/lib/worldcup/team-display-names.ts`
- `src/components/prediction/PredictionForm.tsx`
- `supabase/reports/final_teams_matches_audit_report.md`
