# Assets y jugadores

Este flujo es solo backend/admin. El frontend nunca debe usar `SUPABASE_SERVICE_ROLE_KEY` ni escribir en tablas maestras.

## Variables necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` no se commitea. Guardarla solo en `.env.local` local/admin o en un entorno seguro de CI privado.

## Estructura local esperada

Equipos:

```txt
assets/worldcup-assets/teams/{team_slug}/flag.svg
assets/worldcup-assets/teams/{team_slug}/crest.webp
assets/worldcup-assets/teams/{team_slug}/hero.webp
assets/worldcup-assets/teams/{team_slug}/background.webp
```

Jugadores:

```txt
assets/worldcup-assets/players/{team_slug}/{player_slug}.webp
```

## Comandos

```bash
~/.bun/bin/bun run assets:audit
~/.bun/bin/bun run assets:sync-teams
~/.bun/bin/bun run players:import
```

## Reglas

- No inventar URLs.
- No hotlinkear imagenes de terceros.
- No subir imagenes falsas.
- Si falta un archivo local, el script lo reporta como faltante.
- Si falta foto de jugador, queda placeholder por iniciales en frontend.
- `confirmed` solo aplica a jugadores con fuente, fecha de verificacion, equipo valido y nombre completo.
- Si falta alguna condicion, el importador fuerza `pending_review`.

## Reportes generados

```txt
supabase/reports/assets_players_current_status.md
supabase/reports/worldcup_storage_audit.md
supabase/reports/team_assets_sync_report.md
supabase/reports/players_import_report.md
```
