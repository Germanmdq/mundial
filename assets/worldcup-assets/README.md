# World Cup assets

Esta carpeta es la fuente local para assets reales antes de subirlos a Supabase Storage. No se deben inventar URLs, hotlinkear imagenes ni guardar archivos sin aprobacion de uso.

## Equipos

Convencion esperada:

```txt
assets/worldcup-assets/teams/{team_slug}/flag.svg
assets/worldcup-assets/teams/{team_slug}/crest.webp
assets/worldcup-assets/teams/{team_slug}/hero.webp
assets/worldcup-assets/teams/{team_slug}/background.webp
```

Ejemplo:

```txt
assets/worldcup-assets/teams/argentina/flag.svg
assets/worldcup-assets/teams/argentina/crest.webp
assets/worldcup-assets/teams/argentina/hero.webp
assets/worldcup-assets/teams/argentina/background.webp
```

## Jugadores

Convencion esperada:

```txt
assets/worldcup-assets/players/{team_slug}/{player_slug}.webp
```

Ejemplo:

```txt
assets/worldcup-assets/players/argentina/lionel-messi.webp
```

## Reglas

- Si el archivo local no existe, no se sube y no se inventa URL.
- Si falta flag, crest, hero o background, el frontend usa placeholder premium.
- Si falta foto de jugador, el frontend usa iniciales.
- La service role key se usa solo en scripts admin locales, nunca en frontend.
