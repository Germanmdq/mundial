export type ExternalApiConfig = {
  provider: "api-football" | "thesportsdb" | "football-data";
  baseUrl: string;
  key: string | null;
  enabled: boolean;
  headers: Record<string, string>;
  note?: string;
};

function cleanEnv(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getApiFootballConfig(): ExternalApiConfig {
  const key = cleanEnv(process.env.API_FOOTBALL_KEY);
  return {
    provider: "api-football",
    baseUrl: "https://v3.football.api-sports.io",
    key,
    enabled: Boolean(key),
    headers: key ? { "x-apisports-key": key } : {},
    note: key ? undefined : "Falta API_FOOTBALL_KEY.",
  };
}

export function getTheSportsDbConfig(): ExternalApiConfig {
  const key = cleanEnv(process.env.THESPORTSDB_API_KEY) ?? "3";
  const hasOwnKey = Boolean(cleanEnv(process.env.THESPORTSDB_API_KEY));
  return {
    provider: "thesportsdb",
    baseUrl: `https://www.thesportsdb.com/api/v1/json/${key}`,
    key,
    enabled: Boolean(key),
    headers: {},
    note: hasOwnKey ? undefined : "Usando key publica de prueba de TheSportsDB. Para produccion hace falta key propia.",
  };
}

export function getFootballDataConfig(): ExternalApiConfig {
  const key = cleanEnv(process.env.FOOTBALL_DATA_API_KEY);
  return {
    provider: "football-data",
    baseUrl: "https://api.football-data.org/v4",
    key,
    enabled: Boolean(key),
    headers: key ? { "X-Auth-Token": key } : {},
    note: key ? undefined : "Falta FOOTBALL_DATA_API_KEY.",
  };
}
