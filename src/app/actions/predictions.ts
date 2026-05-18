"use server";

import { getUser } from "@/lib/auth/getUser";
import {
  PaymentRequiredError,
  syncOfficialPredictionDraft,
} from "@/lib/server/predictions";

type ScoreEntry = {
  match_id: number;
  home_goals: number;
  away_goals: number;
};

export async function saveUserPredictions(scores: ScoreEntry[]) {
  const user = await getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para guardar." };
  }

  try {
    const result = await syncOfficialPredictionDraft(
      user.id,
      scores.map((score) => ({
        matchId: score.match_id,
        homeScore: score.home_goals,
        awayScore: score.away_goals,
      })),
    );

    return {
      success: true,
      completedMatches: result.completedMatches,
    };
  } catch (error) {
    if (error instanceof PaymentRequiredError) {
      return {
        success: false,
        error: "Activá tu participación para guardar tu predicción oficial.",
        code: "payment_required",
      };
    }

    console.error("[saveUserPredictions] Exception:", error);
    return { success: false, error: "Error interno del servidor." };
  }
}
