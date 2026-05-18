import { getServiceSupabase, isUserParticipationActive } from "@/lib/server/payments";

export type PredictionScoreInput = {
  matchId: string | number;
  homeScore: number;
  awayScore: number;
};

type SaveOfficialPredictionResult = {
  ok: true;
  saved: true;
  matchId?: string;
  completedMatches: number;
};

export class PaymentRequiredError extends Error {
  constructor(message = "Activá tu participación para guardar tu predicción oficial.") {
    super(message);
    this.name = "PaymentRequiredError";
  }
}

export class PredictionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PredictionValidationError";
  }
}

function parseMatchId(matchId: string | number) {
  const parsed = Number(matchId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new PredictionValidationError("matchId inválido.");
  }

  return parsed;
}

function parseScore(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new PredictionValidationError(`${label} debe ser un entero mayor o igual a cero.`);
  }

  return value;
}

function normalizeScoreInput(input: PredictionScoreInput) {
  return {
    matchId: parseMatchId(input.matchId),
    homeScore: parseScore(input.homeScore, "homeScore"),
    awayScore: parseScore(input.awayScore, "awayScore"),
  };
}

async function assertActiveParticipant(userId: string) {
  if (!(await isUserParticipationActive(userId))) {
    throw new PaymentRequiredError();
  }
}

async function getOrCreatePredictionEntry(userId: string) {
  const supabase = getServiceSupabase();
  const { data: existing, error: existingError } = await supabase
    .from("prediction_entries")
    .select("id, user_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("prediction_entries")
    .insert({
      user_id: userId,
      status: "active",
    })
    .select("id, user_id, status")
    .single();

  if (error) throw error;
  return data;
}

async function assertMatchCanBeEdited(matchId: number) {
  const supabase = getServiceSupabase();
  const { data: match, error } = await supabase
    .from("matches")
    .select("id, kickoff_at")
    .eq("id", matchId)
    .maybeSingle();

  if (error) throw error;
  if (!match) throw new PredictionValidationError("Partido inexistente.");

  if (match.kickoff_at && new Date(match.kickoff_at).getTime() <= Date.now()) {
    throw new PredictionValidationError("Este partido ya está bloqueado.");
  }
}

async function countCompletedMatches(userId: string) {
  const supabase = getServiceSupabase();
  const withCompleted = await supabase
    .from("prediction_match_scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true);

  if (!withCompleted.error) return withCompleted.count ?? 0;

  const fallback = await supabase
    .from("prediction_match_scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (fallback.error) throw fallback.error;
  return fallback.count ?? 0;
}

async function upsertScores(userId: string, scores: PredictionScoreInput[]) {
  const supabase = getServiceSupabase();
  const entry = await getOrCreatePredictionEntry(userId);
  const normalized = scores.map(normalizeScoreInput);

  for (const score of normalized) {
    await assertMatchCanBeEdited(score.matchId);
  }

  const now = new Date().toISOString();
  const payload = normalized.map((score) => ({
    entry_id: entry.id,
    user_id: userId,
    match_id: score.matchId,
    home_goals: score.homeScore,
    away_goals: score.awayScore,
    completed: true,
    updated_at: now,
  }));

  if (payload.length === 0) return;

  const { error } = await supabase
    .from("prediction_match_scores")
    .upsert(payload, { onConflict: "user_id,match_id" });

  if (!error) return;

  if (String(error.message).includes("completed")) {
    const fallbackPayload = payload.map((row) => {
      const { completed, ...rest } = row;
      void completed;
      return rest;
    });
    const fallback = await supabase
      .from("prediction_match_scores")
      .upsert(fallbackPayload, { onConflict: "user_id,match_id" });

    if (fallback.error) throw fallback.error;
    return;
  }

  throw error;
}

export async function saveOfficialMatchPrediction(userId: string, input: PredictionScoreInput): Promise<SaveOfficialPredictionResult> {
  await assertActiveParticipant(userId);
  await upsertScores(userId, [input]);

  return {
    ok: true,
    saved: true,
    matchId: String(input.matchId),
    completedMatches: await countCompletedMatches(userId),
  };
}

export async function syncOfficialPredictionDraft(userId: string, scores: PredictionScoreInput[]): Promise<SaveOfficialPredictionResult> {
  await assertActiveParticipant(userId);
  await upsertScores(userId, scores);

  return {
    ok: true,
    saved: true,
    completedMatches: await countCompletedMatches(userId),
  };
}

export async function getOfficialPrediction(userId: string) {
  await assertActiveParticipant(userId);
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("prediction_match_scores")
    .select("match_id, home_goals, away_goals, completed, updated_at")
    .eq("user_id", userId)
    .order("match_id", { ascending: true });

  if (error) {
    if (String(error.message).includes("completed")) {
      const fallback = await supabase
        .from("prediction_match_scores")
        .select("match_id, home_goals, away_goals, updated_at")
        .eq("user_id", userId)
        .order("match_id", { ascending: true });

      if (fallback.error) throw fallback.error;
      const rows = fallback.data ?? [];
      return {
        scores: rows.map((row) => ({
          matchId: String(row.match_id),
          homeScore: row.home_goals,
          awayScore: row.away_goals,
          completed: true,
        })),
        completedMatches: rows.length,
      };
    }

    throw error;
  }

  const rows = data ?? [];
  return {
    scores: rows.map((row) => ({
      matchId: String(row.match_id),
      homeScore: row.home_goals,
      awayScore: row.away_goals,
      completed: row.completed ?? true,
    })),
    completedMatches: rows.filter((row) => row.completed ?? true).length,
  };
}

export async function getOfficialPredictionSummary(userId: string) {
  const completedMatches = await countCompletedMatches(userId);

  return {
    completedMatches,
    remainingMatches: Math.max(0, 104 - completedMatches),
    groupsCompleted: Math.floor(completedMatches / 6),
  };
}
