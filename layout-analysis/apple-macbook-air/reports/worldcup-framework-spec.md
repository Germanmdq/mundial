# Mundial entre Amigos — Framework Spec inspirado en arquitectura editorial premium

Este documento NO copia Apple. Traduce la arquitectura medida hacia una Home propia para Mundial entre Amigos.

## Orden final de secciones

1. Global header sticky
2. Local nav sticky
3. Hero editorial
4. Highlights slider
5. Slider de 10 jugadores
6. Cómo funciona
7. Competí contra tus amigos
8. Tu Mundial partido por partido
9. Ranking preview
10. Premios / pozo como capítulo interno
11. Partidos Dorados
12. Equipos y jugadores
13. Reglas claras
14. Esto no es apuesta
15. CTA final
16. Footer legal

## Tokens visuales

- page-bg: #f5f5f7
- surface: #ffffff
- surface-soft: #f7f8fa
- text-primary: #111111
- text-secondary: #5f6368
- accent: #0b7a3b
- accent-dark: #07552a
- accent-blue: #0a66c2
- gold: #c9a227
- radius-card: 18px
- radius-large: 28px
- shadow-card: 0 8px 28px rgba(0,0,0,0.08)

## Layout base

- Global nav max-width: 1024px
- Main container: 980px
- Wide container / sliders: 1680px
- Tablet container: 692px
- Mobile width: 87.5vw
- Section padding desktop: 120px 0
- Section padding tablet: 88px 0
- Section padding mobile: 72px 0

## 1. Global Header

- height: 44px desktop / 48px mobile
- sticky top: 0
- backdrop blur
- max-width: 1024px
- links: Cómo funciona, Fixture, Ranking, Premios, Reglas
- CTA: Entrar

## 2. Local Nav

- height: 52px desktop / 48px mobile
- sticky under global header
- max-width: 980px
- title: Mundial 2026
- anchors: Highlights, Cómo funciona, Ranking, Premios
- CTA: Mi predicción

## 3. Hero Editorial

- padding-top: 90px
- padding-bottom: 80px
- centered content
- H1: clamp(44px, 6vw, 64px)
- visual stage desktop: 980px x 470px
- visual stage tablet: 692px x 420px
- visual stage mobile: 87.5vw x 360px
- main message: Competí con tus amigos partido por partido.
- no cash-first message.

## 4. Highlights Slider

- horizontal rail
- scroll snap
- card desktop: 300px x 420px
- card mobile: 220px x 360px
- gap: 30px
- slides:
  1. Predecí todos los partidos
  2. Competí contra tus amigos
  3. Ranking en vivo
  4. Partidos Dorados
  5. Equipos y jugadores
  6. Premios por capítulos
  7. Tu cuenta con progreso

## 5. Slider de 10 jugadores

- horizontal rail
- desktop card: 300px x 440px
- mobile card: 240px x 380px
- badge: En revisión si status !== confirmed
- no decir plantel oficial.

## 6. Cómo funciona

- bento grid 2 columnas desktop
- 1 columna mobile
- card min-height: 300px
- cards:
  1. Creá tu predicción
  2. Pronosticá partido por partido
  3. Sumá puntos por aciertos
  4. Competí en el ranking

## 7. Competí contra tus amigos

- chapter opener
- leaderboard visual
- desktop visual: 980px x 560px
- empty state: El ranking aparece cuando empiecen los partidos.

## 8. Tu Mundial partido por partido

- fixture preview
- predictions columns: home_goals / away_goals
- no usar home_score / away_score
- desktop card height: 88px
- mobile vertical cards
- fallback: Fixture en actualización.

## 9. Ranking Preview

- 3 metrics arriba
- table compact abajo
- mobile metrics horizontal rail

## 10. Premios / Pozo

- capítulo interno, nunca arriba
- no cash-first hero
- packs:
  - Pack Apple
  - Pack Gamer Mundial
  - Pack Living Mundial
  - Pack Creador
  - Pack Libre Tech
- image_url null -> placeholder premium.

## 11. Partidos Dorados

- bonus section
- premium sport style
- no casino visual.

## 12. Equipos y jugadores

- team grid: 4 columns desktop, 3 tablet, 2 mobile
- player rail horizontal
- placeholders if missing assets
- players pending -> En revisión.

## 13. Reglas claras

- bento grid
- resultado exacto: 5 puntos
- ganador/empate correcto: 3 puntos
- diferencia gol correcta: 2 puntos
- goles exactos equipo: 1 punto
- bonus configurables.

## 14. Esto no es apuesta

- legal trust chapter
- no odds
- no casino
- no sportsbook
- social prediction game.

## 15. CTA final

- centered
- H2: 72px desktop / 44px mobile
- text: Armá tu predicción y competí con tus amigos.
- CTA: Crear mi predicción

## 16. Footer legal

- multi-column desktop
- accordion mobile
- links: Reglas, Términos, Privacidad, Contacto, Soporte
