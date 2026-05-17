"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/getUser";
import { getCurrentPredictionSession, createPredictionSession } from "@/lib/worldcup/predictions";

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
    const supabase = await createClient();
    
    // 1. Get or create session
    let session = await getCurrentPredictionSession(user.id);
    if (!session) {
      session = await createPredictionSession(user.id);
    }
    
    if (!session) {
      return { success: false, error: "No se pudo crear la sesión de predicción." };
    }

    // 2. Prepare payload
    const payload = scores.map(score => ({
      match_id: score.match_id,
      user_id: user.id,
      session_id: session.id,
      home_goals: score.home_goals,
      away_goals: score.away_goals,
    }));

    if (payload.length === 0) {
      return { success: true };
    }

    // 3. Upsert
    const { error } = await supabase.from('predictions').upsert(payload, { 
      onConflict: 'user_id, match_id' // Assuming composite unique constraint on these. If not, supabase upsert handles PK.
    });

    if (error) {
      console.error("[saveUserPredictions] Error upserting:", error);
      return { success: false, error: "Hubo un problema guardando tus predicciones." };
    }

    // Update session progress (backend might do this via trigger, but we can update updated_at if needed)
    await supabase.from('prediction_sessions').update({ updated_at: new Date().toISOString() }).eq('id', session.id);

    return { success: true };

  } catch (error) {
    console.error("[saveUserPredictions] Exception:", error);
    return { success: false, error: "Error interno del servidor." };
  }
}
