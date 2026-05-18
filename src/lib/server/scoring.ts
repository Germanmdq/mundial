import { getServiceSupabase } from "@/lib/server/payments";

export type MatchOutcome = "home" | "away" | "draw";

export type MatchPointsResult = {
  points: number;
  exactScore: boolean;
  correctOutcome: boolean;
  correctGoalDifference: boolean;
  goalError: number;
};

type PredictionRow = {
  id: string | number;
  user_id: string;
  match_id: string | number;
  home_goals: number;
  away_goals: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type MatchRow = Record<string, unknown> & {
  id: string | number;
};

type ScoringResultRow = {
  user_id: string;
  match_id: string;
  points: number;
  exact_score: boolean;
  correct_outcome: boolean;
  correct_goal_difference: boolean;
  goal_error: number;
  calculated_at?: string | null;
};

type ActiveParticipantRow = {
  user_id: string;
  created_at?: string | null;
};

export type OfficialLeaderboardEntry = {
  user_id: string;
  display_name: string;
  total_points: number;
  exact_scores_count: number;
  correct_outcomes_count: number;
  correct_goal_differences_count: number;
  total_goal_error: number;
  scored_matches_count: number;
  rank_position: number;
};

export function getOutcome(homeScore: number, awayScore: number): MatchOutcome {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function calculateMatchPoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number,
): MatchPointsResult {
  const exactScore = predHome === realHome && predAway === realAway;
  const correctOutcome = getOutcome(predHome, predAway) === getOutcome(realHome, realAway);
  const correctGoalDifference = predHome - predAway === realHome - realAway;
  const goalError = Math.abs(predHome - realHome) + Math.abs(predAway - realAway);

  let points = 0;
  if (exactScore) points = 5;
  else if (correctOutcome && correctGoalDifference) points = 4;
  else if (correctOutcome) points = 3;

  return {
    points,
    exactScore,
    correctOutcome,
    correctGoalDifference,
    goalError,
  };
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getActualScore(match: MatchRow) {
  const homeCandidates = [
    "actual_home_score",
    "actual_home_goals",
    "home_score",
    "home_goals",
    "score_home",
  ];
  const awayCandidates = [
    "actual_away_score",
    "actual_away_goals",
    "away_score",
    "away_goals",
    "score_away",
  ];

  const home = homeCandidates.map((key) => getNumber(match[key])).find((value) => value !== null) ?? null;
  const away = awayCandidates.map((key) => getNumber(match[key])).find((value) => value !== null) ?? null;

  if (home === null || away === null) return null;
  return { home, away };
}

async function getActiveParticipants(): Promise<ActiveParticipantRow[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("user_participation")
    .select("user_id, created_at")
    .eq("status", "active")
    .eq("paid", true)
    .eq("payment_status", "approved");

  if (error) throw error;
  return (data ?? []) as ActiveParticipantRow[];
}

export async function calculateUserScore(userId: string) {
  const supabase = getServiceSupabase();

  const [{ data: predictions, error: predictionsError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase
      .from("predictions")
      .select("id, user_id, match_id, home_goals, away_goals, created_at, updated_at")
      .eq("user_id", userId),
    supabase.from("matches").select("*"),
  ]);

  if (predictionsError) throw predictionsError;
  if (matchesError) throw matchesError;

  const matchById = new Map<string, MatchRow>();
  for (const match of (matches ?? []) as MatchRow[]) {
    matchById.set(String(match.id), match);
  }

  const rows = ((predictions ?? []) as PredictionRow[])
    .map((prediction) => {
      const match = matchById.get(String(prediction.match_id));
      if (!match) return null;

      const actual = getActualScore(match);
      if (!actual) return null;

      const result = calculateMatchPoints(
        prediction.home_goals,
        prediction.away_goals,
        actual.home,
        actual.away,
      );

      return {
        user_id: prediction.user_id,
        prediction_id: typeof prediction.id === "string" ? prediction.id : null,
        match_id: String(prediction.match_id),
        predicted_home_score: prediction.home_goals,
        predicted_away_score: prediction.away_goals,
        actual_home_score: actual.home,
        actual_away_score: actual.away,
        points: result.points,
        exact_score: result.exactScore,
        correct_outcome: result.correctOutcome,
        correct_goal_difference: result.correctGoalDifference,
        goal_error: result.goalError,
        calculated_at: new Date().toISOString(),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length > 0) {
    const { error } = await supabase
      .from("prediction_scoring_results")
      .upsert(rows, { onConflict: "user_id,match_id" });

    if (error) throw error;
  }

  return summarizeRows(rows);
}

export async function recalculateAllScores() {
  const participants = await getActiveParticipants();
  const summaries = [];

  for (const participant of participants) {
    summaries.push({
      user_id: participant.user_id,
      ...(await calculateUserScore(participant.user_id)),
    });
  }

  return summaries;
}

function summarizeRows(rows: Array<{ points: number; exact_score: boolean; correct_outcome: boolean; correct_goal_difference: boolean; goal_error: number }>) {
  return {
    total_points: rows.reduce((sum, row) => sum + row.points, 0),
    exact_scores_count: rows.filter((row) => row.exact_score).length,
    correct_outcomes_count: rows.filter((row) => row.correct_outcome).length,
    correct_goal_differences_count: rows.filter((row) => row.correct_goal_difference).length,
    total_goal_error: rows.reduce((sum, row) => sum + row.goal_error, 0),
    scored_matches_count: rows.length,
  };
}

function compareLeaderboardEntries(a: OfficialLeaderboardEntry & { completed_at?: string }, b: OfficialLeaderboardEntry & { completed_at?: string }) {
  return (
    b.total_points - a.total_points
    || b.exact_scores_count - a.exact_scores_count
    || b.correct_outcomes_count - a.correct_outcomes_count
    || b.correct_goal_differences_count - a.correct_goal_differences_count
    || a.total_goal_error - b.total_goal_error
    || String(a.completed_at ?? "").localeCompare(String(b.completed_at ?? ""))
    || a.display_name.localeCompare(b.display_name)
  );
}

export async function getOfficialLeaderboard(): Promise<OfficialLeaderboardEntry[]> {
  const supabase = getServiceSupabase();
  const participants = await getActiveParticipants();
  const userIds = participants.map((participant) => participant.user_id);

  if (userIds.length === 0) return [];

  const [{ data: scoringRows, error: scoringError }, { data: profiles }] = await Promise.all([
    supabase
      .from("prediction_scoring_results")
      .select("user_id, match_id, points, exact_score, correct_outcome, correct_goal_difference, goal_error, calculated_at")
      .in("user_id", userIds),
    supabase
      .from("profiles")
      .select("id, display_name, email")
      .in("id", userIds),
  ]);

  if (scoringError) throw scoringError;

  const rowsByUser = new Map<string, ScoringResultRow[]>();
  for (const row of (scoringRows ?? []) as ScoringResultRow[]) {
    const current = rowsByUser.get(row.user_id) ?? [];
    current.push(row);
    rowsByUser.set(row.user_id, current);
  }

  const profileByUser = new Map<string, { display_name?: string | null; email?: string | null }>();
  for (const profile of (profiles ?? []) as Array<{ id: string; display_name?: string | null; email?: string | null }>) {
    profileByUser.set(profile.id, profile);
  }

  const withTieFields = participants.map((participant) => {
    const profile = profileByUser.get(participant.user_id);
    const summary = summarizeRows(rowsByUser.get(participant.user_id) ?? []);
    return {
      user_id: participant.user_id,
      display_name: profile?.display_name || profile?.email || "Participante",
      ...summary,
      rank_position: 0,
      completed_at: participant.created_at ?? "",
    };
  });

  withTieFields.sort(compareLeaderboardEntries);

  return withTieFields.map((entry, index) => ({
    user_id: entry.user_id,
    display_name: entry.display_name,
    total_points: entry.total_points,
    exact_scores_count: entry.exact_scores_count,
    correct_outcomes_count: entry.correct_outcomes_count,
    correct_goal_differences_count: entry.correct_goal_differences_count,
    total_goal_error: entry.total_goal_error,
    scored_matches_count: entry.scored_matches_count,
    rank_position: index + 1,
  }));
}
