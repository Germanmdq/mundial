import React from "react";
import { getMatches } from "@/lib/worldcup/matches";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUser } from "@/lib/auth/getUser";
import { PredictionForm } from "./PredictionForm";
import { createClient } from "@/lib/supabase/server";

type PredictionScreenProps = {
  debugPrediction?: boolean;
};

export async function PredictionScreen({ debugPrediction = false }: PredictionScreenProps) {
  const user = await getUser();
  const matches = await getMatches();
  const matchIds = new Set(matches.map((match) => Number(match.id)));

  const initialScores: Record<number, { home: number; away: number }> = {};
  if (user) {
    const supabase = await createClient();
    const { data: predictions } = await supabase
      .from('prediction_match_scores')
      .select('match_id, home_goals, away_goals')
      .eq('user_id', user.id);
      
    if (predictions) {
      predictions.forEach(p => {
        const matchId = Number(p.match_id);
        if (matchIds.has(matchId)) {
          initialScores[matchId] = { home: p.home_goals, away: p.away_goals };
        }
      });
    }
  }

  if (debugPrediction || process.env.NODE_ENV !== "production") {
    console.info("[mi-prediccion:page]", {
      matchesLength: matches.length,
      initialScoresCount: Object.keys(initialScores).length,
      firstMatch: matches[0]?.home_team ?? null,
      lastMatch: matches[matches.length - 1]?.away_team ?? null,
    });
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState 
          icon="calendar_today" 
          title="Fixture en actualización" 
          description="Estamos terminando de cargar el calendario oficial. Vuelve pronto para empezar tu predicción." 
        />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "min(1180px, 87.5vw)" }}>
      <PredictionForm 
        matches={matches} 
        isLoggedIn={!!user} 
        initialScores={initialScores} 
      />
    </div>
  );
}
