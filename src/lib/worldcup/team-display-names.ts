export const TEAM_DISPLAY_NAMES_ES: Record<string, string> = {
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "Korea Republic": "Corea del Sur",
  "South Korea": "Corea del Sur",
  "Czechia": "Chequia",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Canada": "Canadá",
  "Germany": "Alemania",
  "England": "Inglaterra",
  "Scotland": "Escocia",
  "Türkiye": "Turquía",
  "Turkey": "Turquía",
  "Japan": "Japón",
  "Morocco": "Marruecos",
  "Côte d'Ivoire": "Costa de Marfil",
  "Cote d'Ivoire": "Costa de Marfil",
  "Ivory Coast": "Costa de Marfil",
  "Saudi Arabia": "Arabia Saudita",
  "New Zealand": "Nueva Zelanda",
  "Cape Verde": "Cabo Verde",
  "Iran": "Irán",
  "Spain": "España",
  "Switzerland": "Suiza",
  "Netherlands": "Países Bajos",
  "Belgium": "Bélgica",
  "Croatia": "Croacia",
  "Denmark": "Dinamarca",
  "Poland": "Polonia",
  "France": "Francia",
  "Brazil": "Brasil",
  "Argentina": "Argentina",
  "Uruguay": "Uruguay",
  "Colombia": "Colombia",
  "Ecuador": "Ecuador",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Haiti": "Haití",
  "Qatar": "Catar",
  "Tunisia": "Túnez",
  "Egypt": "Egipto",
  "Algeria": "Argelia",
  "Ghana": "Ghana",
  "Senegal": "Senegal",
  "Nigeria": "Nigeria",
  "Cameroon": "Camerún",
  "Mali": "Malí",
  "Uzbekistan": "Uzbekistán",
  "Jordan": "Jordania",
  "Iraq": "Irak",
  "United Arab Emirates": "Emiratos Árabes Unidos",
  "Jamaica": "Jamaica",
  "Panama": "Panamá",
  "Costa Rica": "Costa Rica",
  "Honduras": "Honduras",
  "Bolivia": "Bolivia",
  "Venezuela": "Venezuela",
  "Bosnia-Herzegovina": "Bosnia y Herzegovina",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Norway": "Noruega",
  "Wales": "Gales",
};

export const TEAM_FLAGS: Record<string, string> = {
  "Mexico": "🇲🇽",
  "South Africa": "🇿🇦",
  "Korea Republic": "🇰🇷",
  "South Korea": "🇰🇷",
  "Czechia": "🇨🇿",
  "United States": "🇺🇸",
  "USA": "🇺🇸",
  "Canada": "🇨🇦",
  "Germany": "🇩🇪",
  "England": "🏴",
  "Scotland": "🏴",
  "Wales": "🏴",
  "Türkiye": "🇹🇷",
  "Turkey": "🇹🇷",
  "Japan": "🇯🇵",
  "Morocco": "🇲🇦",
  "Côte d'Ivoire": "🇨🇮",
  "Cote d'Ivoire": "🇨🇮",
  "Ivory Coast": "🇨🇮",
  "Saudi Arabia": "🇸🇦",
  "New Zealand": "🇳🇿",
  "Cape Verde": "🇨🇻",
  "Iran": "🇮🇷",
  "Spain": "🇪🇸",
  "Switzerland": "🇨🇭",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Croatia": "🇭🇷",
  "Denmark": "🇩🇰",
  "Poland": "🇵🇱",
  "France": "🇫🇷",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Uruguay": "🇺🇾",
  "Colombia": "🇨🇴",
  "Ecuador": "🇪🇨",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Haiti": "🇭🇹",
  "Qatar": "🇶🇦",
  "Tunisia": "🇹🇳",
  "Egypt": "🇪🇬",
  "Algeria": "🇩🇿",
  "Ghana": "🇬🇭",
  "Senegal": "🇸🇳",
  "Nigeria": "🇳🇬",
  "Cameroon": "🇨🇲",
  "Mali": "🇲🇱",
  "Uzbekistan": "🇺🇿",
  "Jordan": "🇯🇴",
  "Iraq": "🇮🇶",
  "United Arab Emirates": "🇦🇪",
  "Jamaica": "🇯🇲",
  "Panama": "🇵🇦",
  "Costa Rica": "🇨🇷",
  "Honduras": "🇭🇳",
  "Bolivia": "🇧🇴",
  "Venezuela": "🇻🇪",
  "Bosnia-Herzegovina": "🇧🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  "Norway": "🇳🇴",
};

export function getTeamDisplayName(name?: string | null): string {
  if (!name) return "Equipo por definir";
  
  const exactMatch = TEAM_DISPLAY_NAMES_ES[name];
  if (exactMatch) return exactMatch;

  const lowerName = name.toLowerCase().trim();
  for (const [key, value] of Object.entries(TEAM_DISPLAY_NAMES_ES)) {
    if (key.toLowerCase() === lowerName) return value;
  }

  return name;
}

export function getTeamDisplayCode(code?: string | null, name?: string | null) {
  if (code) return code.toUpperCase();

  const display = getTeamDisplayName(name);
  return display
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 3)
    .toUpperCase();
}

export function getTeamFlag(name: string | null): string | null {
  if (!name) return null;
  
  const exactMatch = TEAM_FLAGS[name];
  if (exactMatch) return exactMatch;

  const lowerName = name.toLowerCase().trim();
  for (const [key, value] of Object.entries(TEAM_FLAGS)) {
    if (key.toLowerCase() === lowerName) return value;
  }

  return null;
}

export function getTeamCode(name: string | null): string {
  return getTeamDisplayCode(null, name);
}
