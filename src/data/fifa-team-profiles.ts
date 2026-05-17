export type FifaTeamProfile = {
  teamSlug: string
  teamName: string
  displayNameEs: string
  fifaProfileUrl?: string
  publishedAt?: string
  coach?: string
  groupName?: string
  qualificationSummary?: string
  confederation?: string
  bestResult?: string
  bestResultYears?: string[]
  lastWorldCup?: string
  lastWorldCupResult?: string
  firstWorldCup?: string
  appearancesCount?: number
  appearancesYears?: string[]
  currentQualificationStreak?: string
  hostYears?: string[]
  record?: {
    played?: number
    wins?: number
    draws?: number
    losses?: number
    goalsFor?: number
    goalsAgainst?: number
  }
  topScorer?: {
    name?: string
    goals?: number
  }
  mostAppearances?: {
    name?: string
    matches?: number
  }
  biggestWin?: string
  iconicMomentsSummary?: string
  shortHistorySummary?: string
  status: 'imported' | 'missing_profile' | 'ambiguous' | 'extraction_partial' | 'error'
  notes?: string
}

export const FIFA_TEAM_PROFILES: Record<string, FifaTeamProfile> = {
  "algeria": {
    "teamSlug": "algeria",
    "teamName": "Algeria",
    "displayNameEs": "Algeria",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "argentina": {
    "teamSlug": "argentina",
    "teamName": "Argentina",
    "displayNameEs": "Argentina",
    "confederation": "CONMEBOL",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "australia": {
    "teamSlug": "australia",
    "teamName": "Australia",
    "displayNameEs": "Australia",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "austria": {
    "teamSlug": "austria",
    "teamName": "Austria",
    "displayNameEs": "Austria",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "belgium": {
    "teamSlug": "belgium",
    "teamName": "Belgium",
    "displayNameEs": "Belgica",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/belgica-historia-perfil-mundiales",
    "confederation": "UEFA",
    "bestResult": "Tercer puesto",
    "bestResultYears": [
      "2018"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "appearancesCount": 15,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Belgica vuelve con una historia de presencia frecuente y su techo mundialista en el tercer puesto de 2018.",
    "shortHistorySummary": "Belgica vuelve con una historia de presencia frecuente y su techo mundialista en el tercer puesto de 2018.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "bosnia-and-herzegovina": {
    "teamSlug": "bosnia-and-herzegovina",
    "teamName": "Bosnia and Herzegovina",
    "displayNameEs": "Bosnia y Herzegovina",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "brazil": {
    "teamSlug": "brazil",
    "teamName": "Brazil",
    "displayNameEs": "Brasil",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/brasil-perfil-copa-mundial-historia-trayectoria",
    "confederation": "CONMEBOL",
    "bestResult": "Campeon",
    "bestResultYears": [
      "1958",
      "1962",
      "1970",
      "1994",
      "2002"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Cuartos de final",
    "appearancesCount": 23,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Brasil mantiene la marca historica de haber disputado todas las Copas del Mundo y busca su sexto titulo.",
    "shortHistorySummary": "Brasil mantiene la marca historica de haber disputado todas las Copas del Mundo y busca su sexto titulo.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "canada": {
    "teamSlug": "canada",
    "teamName": "Canada",
    "displayNameEs": "Canada",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/canada-en-la-copa-mundial-de-la-fifa-perfil-y-trayectoria-de-la-seleccion",
    "confederation": "CONCACAF",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "1986",
    "appearancesCount": 3,
    "appearancesYears": [
      "1986",
      "2022",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Canada llega como coanfitriona y encadena participaciones mundialistas tras su regreso en 2022.",
    "shortHistorySummary": "Canada llega como coanfitriona y encadena participaciones mundialistas tras su regreso en 2022.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "cape-verde": {
    "teamSlug": "cape-verde",
    "teamName": "Cape Verde",
    "displayNameEs": "Cabo Verde",
    "confederation": "CAF",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "colombia": {
    "teamSlug": "colombia",
    "teamName": "Colombia",
    "displayNameEs": "Colombia",
    "confederation": "CONMEBOL",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "croatia": {
    "teamSlug": "croatia",
    "teamName": "Croatia",
    "displayNameEs": "Croacia",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "curacao": {
    "teamSlug": "curacao",
    "teamName": "Curacao",
    "displayNameEs": "Curazao",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/historia-curazao-copa-mundial",
    "confederation": "CONCACAF",
    "bestResult": "Debut mundialista",
    "bestResultYears": [],
    "firstWorldCup": "2026",
    "appearancesCount": 1,
    "appearancesYears": [
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Curazao llega a su primera Copa Mundial tras una clasificacion historica en Concacaf.",
    "shortHistorySummary": "Curazao llega a su primera Copa Mundial tras una clasificacion historica en Concacaf.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "czechia": {
    "teamSlug": "czechia",
    "teamName": "Czechia",
    "displayNameEs": "Chequia",
    "fifaProfileUrl": "https://www.fifa.com/es/articles/czechia-equipo-perfil-historia-cuando-juegan-partidos",
    "confederation": "UEFA",
    "bestResult": "Fase de grupos",
    "bestResultYears": [
      "2006"
    ],
    "lastWorldCup": "2006",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "2006",
    "appearancesCount": 2,
    "appearancesYears": [
      "2006",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Chequia vuelve a la Copa Mundial con perfil FIFA confirmado y una historia moderna que toma como referencia su participacion de 2006.",
    "shortHistorySummary": "Chequia vuelve a la Copa Mundial con perfil FIFA confirmado y una historia moderna que toma como referencia su participacion de 2006.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "dr-congo": {
    "teamSlug": "dr-congo",
    "teamName": "DR Congo",
    "displayNameEs": "DR Congo",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "ecuador": {
    "teamSlug": "ecuador",
    "teamName": "Ecuador",
    "displayNameEs": "Ecuador",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/ecuador-en-la-copa-mundial-fifa-historia",
    "confederation": "CONMEBOL",
    "bestResult": "Octavos de final",
    "bestResultYears": [
      "2006"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "appearancesCount": 5,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Ecuador disputara su quinta Copa Mundial y busca superar su mejor antecedente de octavos de final.",
    "shortHistorySummary": "Ecuador disputara su quinta Copa Mundial y busca superar su mejor antecedente de octavos de final.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "egypt": {
    "teamSlug": "egypt",
    "teamName": "Egypt",
    "displayNameEs": "Egipto",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/egypt-perfil-seleccion-trayectoria-historia",
    "confederation": "CAF",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "2018",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "1934",
    "appearancesCount": 4,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Egipto suma una nueva participacion mundialista tras una trayectoria historica iniciada en 1934.",
    "shortHistorySummary": "Egipto suma una nueva participacion mundialista tras una trayectoria historica iniciada en 1934.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "england": {
    "teamSlug": "england",
    "teamName": "England",
    "displayNameEs": "Inglaterra",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "france": {
    "teamSlug": "france",
    "teamName": "France",
    "displayNameEs": "Francia",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "germany": {
    "teamSlug": "germany",
    "teamName": "Germany",
    "displayNameEs": "Alemania",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "ghana": {
    "teamSlug": "ghana",
    "teamName": "Ghana",
    "displayNameEs": "Ghana",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/ghana-perfil-seleccion-historia-records",
    "confederation": "CAF",
    "bestResult": "Cuartos de final",
    "bestResultYears": [
      "2010"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "appearancesCount": 5,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Ghana vuelve con el antecedente de cuartos de final en 2010 como mejor actuacion historica.",
    "shortHistorySummary": "Ghana vuelve con el antecedente de cuartos de final en 2010 como mejor actuacion historica.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "haiti": {
    "teamSlug": "haiti",
    "teamName": "Haiti",
    "displayNameEs": "Haiti",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/haiti-copa-mundial-historia-perfil-trayectoria",
    "confederation": "CONCACAF",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "1974",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "1974",
    "appearancesCount": 2,
    "appearancesYears": [
      "1974",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Haiti regresa al Mundial despues de su primera participacion en 1974.",
    "shortHistorySummary": "Haiti regresa al Mundial despues de su primera participacion en 1974.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "iran": {
    "teamSlug": "iran",
    "teamName": "Iran",
    "displayNameEs": "RI de Iran",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/perfil-ri-de-iran-historia",
    "confederation": "AFC",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "appearancesCount": 7,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "La RI de Iran llega a su septima Copa Mundial con presencia sostenida en las ultimas ediciones.",
    "shortHistorySummary": "La RI de Iran llega a su septima Copa Mundial con presencia sostenida en las ultimas ediciones.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "iraq": {
    "teamSlug": "iraq",
    "teamName": "Iraq",
    "displayNameEs": "Irak",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "ivory-coast": {
    "teamSlug": "ivory-coast",
    "teamName": "Ivory Coast",
    "displayNameEs": "Costa de Marfil",
    "confederation": "CAF",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "japan": {
    "teamSlug": "japan",
    "teamName": "Japan",
    "displayNameEs": "Japon",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "jordan": {
    "teamSlug": "jordan",
    "teamName": "Jordan",
    "displayNameEs": "Jordania",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "mexico": {
    "teamSlug": "mexico",
    "teamName": "Mexico",
    "displayNameEs": "Mexico",
    "confederation": "CONCACAF",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "morocco": {
    "teamSlug": "morocco",
    "teamName": "Morocco",
    "displayNameEs": "Marruecos",
    "confederation": "CAF",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "netherlands": {
    "teamSlug": "netherlands",
    "teamName": "Netherlands",
    "displayNameEs": "Paises Bajos",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/paises-bajos-copa-mundial-historia-trayectoria-torneos",
    "confederation": "UEFA",
    "bestResult": "Subcampeon",
    "bestResultYears": [
      "1974",
      "1978",
      "2010"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Cuartos de final",
    "appearancesCount": 12,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Paises Bajos carga con tres finales mundialistas y una tradicion de alto impacto en fases eliminatorias.",
    "shortHistorySummary": "Paises Bajos carga con tres finales mundialistas y una tradicion de alto impacto en fases eliminatorias.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "new-zealand": {
    "teamSlug": "new-zealand",
    "teamName": "New Zealand",
    "displayNameEs": "Nueva Zelanda",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/nueva-zelanda-seleccion-perfil-historia",
    "confederation": "OFC",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "2010",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "1982",
    "appearancesCount": 3,
    "appearancesYears": [
      "1982",
      "2010",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Nueva Zelanda disputara su tercera Copa Mundial y vuelve tras sus antecedentes de 1982 y 2010.",
    "shortHistorySummary": "Nueva Zelanda disputara su tercera Copa Mundial y vuelve tras sus antecedentes de 1982 y 2010.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "norway": {
    "teamSlug": "norway",
    "teamName": "Norway",
    "displayNameEs": "Noruega",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "panama": {
    "teamSlug": "panama",
    "teamName": "Panama",
    "displayNameEs": "Panama",
    "confederation": "CONCACAF",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "paraguay": {
    "teamSlug": "paraguay",
    "teamName": "Paraguay",
    "displayNameEs": "Paraguay",
    "confederation": "CONMEBOL",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "portugal": {
    "teamSlug": "portugal",
    "teamName": "Portugal",
    "displayNameEs": "Portugal",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "qatar": {
    "teamSlug": "qatar",
    "teamName": "Qatar",
    "displayNameEs": "Catar",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/catar-perfil-seleccion-record-historia",
    "confederation": "AFC",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "2022",
    "appearancesCount": 2,
    "appearancesYears": [
      "2022",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Catar afronta su segunda Copa Mundial, primera clasificacion lograda en cancha tras ser anfitrion en 2022.",
    "shortHistorySummary": "Catar afronta su segunda Copa Mundial, primera clasificacion lograda en cancha tras ser anfitrion en 2022.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "saudi-arabia": {
    "teamSlug": "saudi-arabia",
    "teamName": "Saudi Arabia",
    "displayNameEs": "Arabia Saudita",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "scotland": {
    "teamSlug": "scotland",
    "teamName": "Scotland",
    "displayNameEs": "Escocia",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "senegal": {
    "teamSlug": "senegal",
    "teamName": "Senegal",
    "displayNameEs": "Senegal",
    "confederation": "CAF",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "south-africa": {
    "teamSlug": "south-africa",
    "teamName": "South Africa",
    "displayNameEs": "Sudafrica",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/sudafrica-seleccion-trayectoria-historia-records",
    "confederation": "CAF",
    "bestResult": "Fase de grupos",
    "bestResultYears": [
      "1998",
      "2002",
      "2010"
    ],
    "lastWorldCup": "2010",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "1998",
    "appearancesCount": 4,
    "appearancesYears": [
      "1998",
      "2002",
      "2010",
      "2026"
    ],
    "record": {
      "played": 9,
      "wins": 2,
      "draws": 4,
      "losses": 3,
      "goalsFor": 11,
      "goalsAgainst": 16
    },
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Sudafrica vuelve al Mundial tras sus participaciones de 1998, 2002 y 2010, con el objetivo de superar por primera vez la fase de grupos.",
    "shortHistorySummary": "Sudafrica vuelve al Mundial tras sus participaciones de 1998, 2002 y 2010, con el objetivo de superar por primera vez la fase de grupos.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "south-korea": {
    "teamSlug": "south-korea",
    "teamName": "South Korea",
    "displayNameEs": "Republica de Corea",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "spain": {
    "teamSlug": "spain",
    "teamName": "Spain",
    "displayNameEs": "Espana",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/espana-en-la-copa-mundial-de-la-fifa-historia-y-perfil-del-equipo",
    "confederation": "UEFA",
    "bestResult": "Campeon",
    "bestResultYears": [
      "2010"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Octavos de final",
    "appearancesCount": 17,
    "appearancesYears": [],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Espana afronta otra Copa Mundial con el titulo de 2010 como hito mayor de su historia.",
    "shortHistorySummary": "Espana afronta otra Copa Mundial con el titulo de 2010 como hito mayor de su historia.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "sweden": {
    "teamSlug": "sweden",
    "teamName": "Sweden",
    "displayNameEs": "Suecia",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "switzerland": {
    "teamSlug": "switzerland",
    "teamName": "Switzerland",
    "displayNameEs": "Suiza",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "tunisia": {
    "teamSlug": "tunisia",
    "teamName": "Tunisia",
    "displayNameEs": "Tunez",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/tunez-seleccion-perfil-equipo-historia",
    "confederation": "CAF",
    "bestResult": "Fase de grupos",
    "bestResultYears": [],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Fase de grupos",
    "firstWorldCup": "1978",
    "appearancesCount": 7,
    "appearancesYears": [
      "1978",
      "1998",
      "2002",
      "2006",
      "2018",
      "2022",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Tunez llega a su septima Copa Mundial buscando superar por primera vez la fase de grupos.",
    "shortHistorySummary": "Tunez llega a su septima Copa Mundial buscando superar por primera vez la fase de grupos.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "turkey": {
    "teamSlug": "turkey",
    "teamName": "Turkey",
    "displayNameEs": "Turquia",
    "confederation": "UEFA",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "united-states": {
    "teamSlug": "united-states",
    "teamName": "United States",
    "displayNameEs": "Estados Unidos",
    "fifaProfileUrl": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/estados-unidos-perfil-historia-en-los-mundiales",
    "confederation": "CONCACAF",
    "bestResult": "Semifinales",
    "bestResultYears": [
      "1930"
    ],
    "lastWorldCup": "2022",
    "lastWorldCupResult": "Octavos de final",
    "firstWorldCup": "1930",
    "appearancesCount": 12,
    "appearancesYears": [],
    "hostYears": [
      "1994",
      "2026"
    ],
    "record": {},
    "topScorer": {},
    "mostAppearances": {},
    "iconicMomentsSummary": "Estados Unidos sera coanfitrion y busca superar su reciente eliminacion en octavos de final de 2022.",
    "shortHistorySummary": "Estados Unidos sera coanfitrion y busca superar su reciente eliminacion en octavos de final de 2022.",
    "status": "imported",
    "notes": "URL FIFA confirmada por busqueda web; HTML cacheado no contiene articulo renderizado, se usan campos estructurados de revision."
  },
  "uruguay": {
    "teamSlug": "uruguay",
    "teamName": "Uruguay",
    "displayNameEs": "Uruguay",
    "confederation": "CONMEBOL",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
  "uzbekistan": {
    "teamSlug": "uzbekistan",
    "teamName": "Uzbekistan",
    "displayNameEs": "Uzbekistan",
    "confederation": "AFC",
    "status": "missing_profile",
    "notes": "No se encontro perfil FIFA validado."
  },
}
