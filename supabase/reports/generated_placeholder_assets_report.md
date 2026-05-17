# Assets temporales generados

Fecha: 2026-05-17T16:33:45.019Z

- Equipos procesados: 48
- Escudos temporales creados: 48
- Flags temporales creadas: 48
- Heroes temporales creados: 48
- Backgrounds temporales creados: 48
- Jugadores procesados: 718
- Avatares temporales creados: 718
- Archivos publicos generados: 910
- Jugadores omitidos: 0

## Validacion

- lint: pasa (0 errores, 14 warnings)
- tsc: pasa (`bun x tsc --noEmit`)
- build: falla por dependencia local SWC (`@next/swc-darwin-arm64` firma invalida; tras limpiar dependencias tambien falla porque Next intenta usar npm y `npm` no existe en el entorno)

## Omitidos

- Ninguno.
