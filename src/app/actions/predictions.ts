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
    
    // --- SCHEMA A: OLD TABLES (predictions & prediction_sessions) ---
    let session = await getCurrentPredictionSession(user.id);
    if (!session) {
      session = await createPredictionSession(user.id);
    }
    
    if (session) {
      const payloadA = scores.map(score => ({
        match_id: score.match_id,
        user_id: user.id,
        session_id: session.id,
        home_goals: score.home_goals,
        away_goals: score.away_goals,
      }));

      if (payloadA.length > 0) {
        const { error: errorA } = await supabase.from('predictions').upsert(payloadA, { 
          onConflict: 'user_id, match_id'
        });
        if (errorA) {
          console.warn("[saveUserPredictions] Warning upserting to Schema A:", errorA.message);
        } else {
          await supabase.from('prediction_sessions').update({ updated_at: new Date().toISOString() }).eq('id', session.id);
        }
      }
    }

    // --- SCHEMA B: NEW TABLES (prediction_entries & prediction_match_scores) ---
    const { data: entryData, error: entryError } = await supabase
      .from('prediction_entries')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    let entry = entryData;
    
    if (entryError && entryError.code === 'PGRST116') {
      const { data: newEntry, error: insertError } = await supabase
        .from('prediction_entries')
        .insert({ user_id: user.id, status: 'official' })
        .select('id')
        .single();
      
      if (insertError) {
        console.error("[saveUserPredictions] Error creating prediction entry:", insertError);
      } else {
        entry = newEntry;
      }
    }

    if (entry) {
      const payloadB = scores.map(score => ({
        entry_id: entry.id,
        user_id: user.id,
        match_id: score.match_id,
        home_goals: score.home_goals,
        away_goals: score.away_goals,
        updated_at: new Date().toISOString()
      }));

      if (payloadB.length > 0) {
        const { error: errorB } = await supabase.from('prediction_match_scores').upsert(payloadB, {
          onConflict: 'user_id, match_id'
        });
        if (errorB) {
          console.error("[saveUserPredictions] Error upserting to Schema B (prediction_match_scores):", errorB.message);
          return { success: false, error: "Hubo un problema guardando tus predicciones oficiales." };
        }
      }
    } else {
      return { success: false, error: "No se pudo sincronizar tu registro de predicción oficial." };
    }

    return { success: true };

  } catch (error) {
    console.error("[saveUserPredictions] Exception:", error);
    return { success: false, error: "Error interno del servidor." };
  }
}
