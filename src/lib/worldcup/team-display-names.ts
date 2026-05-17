export const TEAM_TRANSLATIONS: Record<string, string> = {
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Czechia": "Chequia",
  "United States": "Estados Unidos",
  "Germany": "Alemania",
  "England": "Inglaterra",
  "Japan": "Japón",
  "Morocco": "Marruecos",
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
  "Portugal": "Portugal",
  "France": "Francia",
  "Brazil": "Brasil",
  "Argentina": "Argentina",
  "Uruguay": "Uruguay",
  "Colombia": "Colombia",
  "Ecuador": "Ecuador",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Canada": "Canadá"
};

export const TEAM_FLAGS: Record<string, string> = {
  "Mexico": "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Czechia": "🇨🇿",
  "United States": "🇺🇸",
  "Germany": "🇩🇪",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Japan": "🇯🇵",
  "Morocco": "🇲🇦",
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
  "Portugal": "🇵🇹",
  "France": "🇫🇷",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Uruguay": "🇺🇾",
  "Colombia": "🇨🇴",
  "Ecuador": "🇪🇨",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Canada": "🇨🇦"
};

export function getTeamDisplayName(name: string | null): string {
  if (!name) return "Por definir";
  return TEAM_TRANSLATIONS[name] || name;
}

export function getTeamFlag(name: string | null): string | null {
  if (!name) return null;
  return TEAM_FLAGS[name] || null;
}

export function getTeamCode(name: string | null): string {
  if (!name) return "???";
  // Special overrides
  if (name === "South Africa") return "RSA";
  if (name === "Saudi Arabia") return "KSA";
  if (name === "South Korea") return "KOR";
  if (name === "Ivory Coast") return "CIV";
  if (name === "New Zealand") return "NZL";
  if (name === "Cape Verde") return "CPV";
  return name.substring(0, 3).toUpperCase();
}
