# FIFA team profiles import report

- Equipos procesados: 48
- URLs de sitemap/articulos candidatas: 15
- Perfiles importados: 15
- Perfiles missing: 33
- Perfiles ambiguous: 0
- Perfiles con extraccion parcial: 0
- Service role detectada: si
- Persistencia Supabase: no ejecutada; no se modifica schema automaticamente.
- Tablas compatibles esperadas si se quiere persistir luego: `team_profiles`, `team_history`, `team_worldcup_history`

## Importados

- Belgica: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/belgica-historia-perfil-mundiales
- Brasil: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/brasil-perfil-copa-mundial-historia-trayectoria
- Canada: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/canada-en-la-copa-mundial-de-la-fifa-perfil-y-trayectoria-de-la-seleccion
- Curazao: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/historia-curazao-copa-mundial
- Ecuador: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/ecuador-en-la-copa-mundial-fifa-historia
- Egipto: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/egypt-perfil-seleccion-trayectoria-historia
- Ghana: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/ghana-perfil-seleccion-historia-records
- Haiti: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/haiti-copa-mundial-historia-perfil-trayectoria
- RI de Iran: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/perfil-ri-de-iran-historia
- Paises Bajos: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/paises-bajos-copa-mundial-historia-trayectoria-torneos
- Nueva Zelanda: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/nueva-zelanda-seleccion-perfil-historia
- Catar: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/catar-perfil-seleccion-record-historia
- Espana: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/espana-en-la-copa-mundial-de-la-fifa-historia-y-perfil-del-equipo
- Tunez: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/tunez-seleccion-perfil-equipo-historia
- Estados Unidos: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/estados-unidos-perfil-historia-en-los-mundiales

## Extraccion parcial

- Ninguno

## Ambiguous

- Ninguno

## Missing

- Algeria
- Argentina
- Australia
- Austria
- Bosnia y Herzegovina
- Cabo Verde
- Colombia
- Croacia
- Chequia
- DR Congo
- Inglaterra
- Francia
- Alemania
- Irak
- Costa de Marfil
- Japon
- Jordania
- Mexico
- Marruecos
- Noruega
- Panama
- Paraguay
- Portugal
- Arabia Saudita
- Escocia
- Senegal
- Sudafrica
- Republica de Corea
- Suecia
- Suiza
- Turquia
- Uruguay
- Uzbekistan

## Proximos pasos

- Revisar `supabase/import/fifa_team_profiles_review.csv` antes de publicar textos como definitivos.
- Completar manualmente perfiles missing/ambiguous cuando FIFA publique o cambie slugs.
- No renderizar HTML cacheado; usar solo datos estructurados y resumen propio.
