# Players frontend visibility report

Fecha: 2026-05-17

## Resultado

- `/jugadores` consulta `public.players_info` desde `src/lib/worldcup/players.ts`.
- La relación de UI agrupa por `team_id`, usando el `id` real de `teams_info`.
- `pending_review` se muestra; no se exige `confirmed`.
- `photo_url` / `photo_storage_path` no son obligatorios; si faltan, `PlayerCard` usa fallback con iniciales.
- El filtro defensivo excluye solo:
  - `status = bogus_ocr`
  - campos con marcadores OCR/Panini/PDF/placeholder
  - nombres basura conocidos o inválidos básicos
- La página quedó marcada como dinámica (`force-dynamic`, `revalidate = 0`) para evitar HTML viejo en producción.
- `getPlayers()` ahora pagina de a 1000 filas para no depender del límite default de Supabase.

## Verificación Supabase REST

Consulta con anon key contra `players_info`:

| Equipo | team_id | Jugadores en Supabase |
| --- | ---: | ---: |
| Brazil | 60 | 54 |
| Mexico | 14 | 68 |
| South Korea | 54 | 26 |
| South Africa | 53 | 0 |
| Czechia | 55 | 0 |

Nota: Mexico no devuelve 114 en la base actual; después de la limpieza OCR segura, Supabase devuelve 68 jugadores válidos/revisables para `team_id = 14`.

## Archivos revisados

- `src/lib/worldcup/players.ts`
- `src/app/jugadores/page.tsx`
- `src/components/worldcup/PlayerCard.tsx`
- `src/components/worldcup/JugadoresClient.tsx`
- `src/lib/worldcup/player-validation.ts`

## Corrección aplicada

- Se corrigió la consulta para paginar `players_info`.
- Se evitó que producción cachee `/jugadores` como página estática.
- Se ajustó la validación para no excluir jugadores por estar en `pending_review`, no tener foto o no tener `status = confirmed`.
