# Wikipedia section players cleanup report

## Problema

El scraper de Wikipedia habia interpretado tablas de navegacion/secciones del articulo como si fueran jugadores. Ejemplos: Bids, Broadcasters, Final draw, General information, Official symbols, Team appearances y Tournaments.

## Resultado

- Total players_info antes: 607
- Candidatos detectados: 0
- Registros borrados: 0
- Registros restantes: 607
- Candidatos restantes a revision manual: 0

## Conteos finales

- Mexico: 55
- Brazil: 54
- South Korea: 26
- South Africa: 0
- Czechia: 0

## Ejemplos borrados

- Ninguno

## Jugadores reales conservados

- José Antonio Rodríguez (mexico)
- Alex Padilla (mexico)
- César Montes (mexico)
- Johan Vásquez (mexico)
- Jesús Alberto Angulo (mexico)
- Mateo Chávez (mexico)
- Richard Ledezma (mexico)
- Denzell García (mexico)
- Ramón Juárez (mexico)
- Alejandro Gómez (mexico)
- Carlos Rodríguez (mexico)
- Luis Romo (mexico)
- Érick Sánchez (mexico)
- Érik Lira (mexico)
- Efraín Álvarez (mexico)
- Alexis Gutiérrez (mexico)
- Obed Vargas (mexico)
- Jordán Carrillo (mexico)
- Álvaro Fidalgo (mexico)
- Alexéi Domínguez (mexico)

## Verificacion de blocklist

- No quedan candidatos de seccion detectados.

## Cambios al scraper

- Solo importa tablas con encabezados claros de plantel.
- Ignora tablas de navegacion, historial, broadcasters, formato, sedes y metadatos.
- Ignora nombres de seccion o nombres que no tienen forma humana.

## Cambios al frontend

- `isLikelyWikipediaSectionPlayer` bloquea secciones conocidas y contenido de articulo.
- `isDisplayablePlayer` excluye filas OCR o secciones de Wikipedia antes de renderizar.

## Errores

- Sin errores
