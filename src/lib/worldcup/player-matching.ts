export type MatchablePlayer = {
  id?: string | number | null;
  name?: string | null;
  display_name?: string | null;
  slug?: string | null;
  team_slug?: string | null;
  team_id?: string | number | null;
};

export type ApiPlayerLike = {
  name: string;
  slug?: string | null;
  team_slug?: string | null;
};

export type PlayerMatchResult = {
  player: MatchablePlayer | null;
  confidence: number;
  status: "auto_matched" | "ambiguous" | "no_match" | "manual_required";
};

export function normalizeName(name: string | null | undefined): string {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyPlayerName(name: string | null | undefined): string {
  return normalizeName(name).replace(/\s+/g, "-");
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  const distance = dp[a.length][b.length];
  return Math.round((1 - distance / Math.max(a.length, b.length)) * 100);
}

export function matchPlayerByNameAndTeam(apiPlayer: ApiPlayerLike, existingPlayers: MatchablePlayer[]): PlayerMatchResult {
  const apiSlug = apiPlayer.slug ?? slugifyPlayerName(apiPlayer.name);
  const apiName = normalizeName(apiPlayer.name);
  const apiTeamSlug = apiPlayer.team_slug ?? null;

  const exactSlugTeam = existingPlayers.filter((player) => {
    return apiTeamSlug && player.team_slug === apiTeamSlug && (player.slug ?? slugifyPlayerName(player.display_name ?? player.name)) === apiSlug;
  });
  if (exactSlugTeam.length === 1) return { player: exactSlugTeam[0], confidence: 100, status: "auto_matched" };
  if (exactSlugTeam.length > 1) return { player: null, confidence: 100, status: "ambiguous" };

  const exactNameTeam = existingPlayers.filter((player) => {
    return apiTeamSlug && player.team_slug === apiTeamSlug && normalizeName(player.display_name ?? player.name) === apiName;
  });
  if (exactNameTeam.length === 1) return { player: exactNameTeam[0], confidence: 100, status: "auto_matched" };
  if (exactNameTeam.length > 1) return { player: null, confidence: 100, status: "ambiguous" };

  const scored = existingPlayers
    .map((player) => {
      const playerName = normalizeName(player.display_name ?? player.name);
      const teamBonus = apiTeamSlug && player.team_slug === apiTeamSlug ? 6 : 0;
      return { player, confidence: Math.min(99, similarity(apiName, playerName) + teamBonus) };
    })
    .filter((item) => item.confidence >= 80)
    .sort((a, b) => b.confidence - a.confidence);

  if (scored.length === 0) return { player: null, confidence: 0, status: "no_match" };
  if (scored.length > 1 && scored[0].confidence === scored[1].confidence) {
    return { player: null, confidence: scored[0].confidence, status: "ambiguous" };
  }

  return {
    player: scored[0].player,
    confidence: scored[0].confidence,
    status: scored[0].confidence >= 90 ? "auto_matched" : "manual_required",
  };
}
