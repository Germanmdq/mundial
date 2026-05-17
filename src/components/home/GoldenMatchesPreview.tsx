import React from "react";
import Link from "next/link";
import { getGoldenMatches } from "@/lib/worldcup/prizes";

export async function GoldenMatchesPreview() {
  const goldenMatches = await getGoldenMatches();

  if (!goldenMatches || goldenMatches.length === 0) {
    return null; // Ocultar sección si no hay golden matches activos
  }

  const nextMatch = goldenMatches[0];
  const homeTeam = nextMatch.home_team_info?.name || nextMatch.home_team || 'Equipo 1';
  const awayTeam = nextMatch.away_team_info?.name || nextMatch.away_team || 'Equipo 2';
  
  // Basic countdown math for display (ideally done on client, but we'll show static for now if we want to stay server-side)
  // Or we could pass the date to a client component. For now, we will just show the date.
  const kickoff = nextMatch.kickoff_at ? new Date(nextMatch.kickoff_at) : null;
  
  return (
    <section className="py-6 bg-white">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="rounded-2xl p-5 md:p-7 border border-[#e5e5e7] bg-[#fafafa] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start md:items-center gap-4">
            {/* Only place gold is used — Golden Match specific */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f7f0e0]">
              <span className="material-symbols-outlined text-[#b5862a] text-[18px]" style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b5862a] animate-pulse" />
                <span className="text-[#b5862a] text-[10px] font-bold uppercase tracking-[0.18em]">Próximo Golden Match</span>
              </div>
              <h3 className="font-display font-bold text-[#1d1d1f] text-[16px]">{homeTeam} vs. {awayTeam}</h3>
              <p className="text-[#6e6e73] text-[13px] mt-0.5">Los puntos de este partido se duplican. Subí en el ranking.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:shrink-0">
            {kickoff && (
              <div className="flex gap-3">
                {/* Fallback to static display of date since this is a server component now */}
                <div className="text-center">
                  <span className="block font-display font-bold text-[#1d1d1f] text-[16px] leading-none">
                    {kickoff.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[#aeaeb2] text-[10px] uppercase tracking-widest">FECHA</span>
                </div>
              </div>
            )}
            <Link href="/partidos-dorados"
              className="bg-[#0071e3] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#0066cc] transition-colors whitespace-nowrap active:scale-95">
              Predecir ahora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
