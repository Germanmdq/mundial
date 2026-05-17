import React from "react";
import { getGroupMatches } from "@/lib/worldcup/matches";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUser } from "@/lib/auth/getUser";
import { PredictionForm } from "./PredictionForm";
import { createClient } from "@/lib/supabase/server";
import { PremiumCard } from "@/components/ui/PremiumCard";

export async function PredictionScreen() {
  const user = await getUser();
  const matches = await getGroupMatches('A');

  const initialScores: Record<number, { home: number; away: number }> = {};
  if (user) {
    const supabase = await createClient();
    const { data: predictions } = await supabase
      .from('predictions')
      .select('match_id, home_goals, away_goals')
      .eq('user_id', user.id);
      
    if (predictions) {
      predictions.forEach(p => {
        initialScores[p.match_id] = { home: p.home_goals, away: p.away_goals };
      });
    }
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
    <div className="max-w-[720px] mx-auto">
      {/* Tab row */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 justify-center" style={{ scrollbarWidth: "none" }}>
        {["Fixture", "Tabla de Grupos", "Goleador"].map((tab, i) => (
          <button
            key={tab}
            className="px-5 py-2.5 rounded-full text-[13px] font-semibold shrink-0 transition-all duration-150 shadow-sm border border-[rgba(0,0,0,0.06)]"
            style={{
              background: i === 0 ? "#1d1d1f" : "white",
              color: i === 0 ? "white" : "#6e6e73",
              border: i === 0 ? "1px solid transparent" : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <PremiumCard>
        {/* Section label */}
        <div className="flex justify-between items-center mb-6 border-b border-[rgba(0,0,0,0.06)] pb-4">
          <span className="text-[11px] font-bold text-[#aeaeb2] uppercase tracking-[0.15em]">Grupo A · Fase de Grupos</span>
          <button className="text-[#0071e3] text-[12px] font-bold tracking-tight hover:underline">Ver fixture completo</button>
        </div>

        {/* Match cards & Form */}
        <PredictionForm 
          matches={matches} 
          isLoggedIn={!!user} 
          initialScores={initialScores} 
        />
      </PremiumCard>
    </div>
  );
}
