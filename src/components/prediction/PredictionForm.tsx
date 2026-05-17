"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { saveUserPredictions } from "@/app/actions/predictions";
import type { Match } from "@/lib/worldcup/matches";
import { PredictionMatchCard } from "./PredictionMatchCard";
import { PredictionStickyBar } from "./PredictionStickyBar";
import { PremiumCard } from "@/components/ui/PremiumCard";

type ScoreValue = number | "";
type LocalScore = { home: ScoreValue; away: ScoreValue; };

interface PredictionFormProps {
  matches: Match[];
  isLoggedIn: boolean;
  initialScores?: Record<number, { home: number; away: number }>;
}

const TABS = ["Partidos", "Grupos", "Goleador"] as const;
type TabOption = typeof TABS[number];

export function PredictionForm({ matches, isLoggedIn, initialScores = {} }: PredictionFormProps) {
  const [scores, setScores] = useState<Record<number, LocalScore>>(() => {
    return matches.reduce((acc, match) => {
      const existing = initialScores[match.id];
      acc[match.id] = {
        home: typeof existing?.home === "number" ? existing.home : "",
        away: typeof existing?.away === "number" ? existing.away : ""
      };
      return acc;
    }, {} as Record<number, LocalScore>);
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabOption>("Partidos");
  const [selectedFilter, setSelectedFilter] = useState<string>("Todos");

  // Progress Panel Data
  const totalMatches = matches.length || 104;
  const completedMatches = useMemo(() => {
    return Object.values(scores).filter(s => typeof s.home === "number" && typeof s.away === "number").length;
  }, [scores]);

  // Derived filters
  const groups = useMemo(() => {
    const g = new Set<string>();
    matches.forEach(m => {
      if (m.group_letter) g.add(`Grupo ${m.group_letter}`);
    });
    return ["Todos", ...Array.from(g).sort()];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (selectedFilter === "Todos") return matches;
    if (selectedFilter.startsWith("Grupo ")) {
      const letter = selectedFilter.replace("Grupo ", "");
      return matches.filter(m => m.group_letter === letter);
    }
    return matches;
  }, [matches, selectedFilter]);

  const handleScoreChange = (matchId: number, type: 'home' | 'away', val: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [type]: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0)
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }

    setIsSaving(true);

    const payload = Object.entries(scores)
      .filter(([_, score]) => typeof score.home === "number" && typeof score.away === "number")
      .map(([matchIdStr, score]) => ({
        match_id: parseInt(matchIdStr, 10),
        home_goals: score.home as number,
        away_goals: score.away as number
      }));

    if (payload.length > 0) {
      const result = await saveUserPredictions(payload);
      if (result.success) {
        setHasUnsavedChanges(false);
      } else {
        console.error(result.error);
        alert("Error al guardar las predicciones.");
      }
    }
    
    setIsSaving(false);
  };

  return (
    <div className="predictionContent space-y-8 pb-[120px] w-full max-w-full overflow-x-hidden">
      
      {/* Progress Panel */}
      <PremiumCard className="!p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="flex flex-col">
          <span className="text-[11px] text-[#aeaeb2] font-bold uppercase tracking-widest mb-1">Partidos Completados</span>
          <span className="text-2xl font-display font-extrabold text-[#1d1d1f]">{completedMatches} <span className="text-lg text-[#aeaeb2] font-semibold">/ {totalMatches}</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-[#aeaeb2] font-bold uppercase tracking-widest mb-1">Grupos Cargados</span>
          <span className="text-2xl font-display font-extrabold text-[#1d1d1f]">0 <span className="text-lg text-[#aeaeb2] font-semibold">/ 12</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-[#aeaeb2] font-bold uppercase tracking-widest mb-1">Estado</span>
          <span className="text-sm font-bold" style={{ color: hasUnsavedChanges ? "#ff9500" : "#34a853" }}>
            {hasUnsavedChanges ? "Cambios pendientes" : "Guardado"}
          </span>
        </div>
        <div className="flex justify-end md:justify-end">
          <button 
            onClick={isLoggedIn ? handleSave : () => setShowModal(true)}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-[#0071e3] text-white px-6 py-3 rounded-full text-[14px] font-bold hover:bg-[#0077ed] active:scale-95 transition-all disabled:opacity-50 disabled:bg-[#aeaeb2] w-full md:w-auto"
          >
            {isSaving ? "Guardando..." : "Guardar predicción"}
          </button>
        </div>
      </PremiumCard>

      {/* Tabs */}
      <div className="w-full flex justify-center mt-6">
        <div className="inline-flex bg-[rgba(255,255,255,0.72)] border rounded-full p-1.5 shadow-sm overflow-x-auto max-w-full" style={{ borderColor: "rgba(0,0,0,0.08)", scrollbarWidth: "none" }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="h-[42px] px-5 rounded-full text-[14px] font-bold transition-colors shrink-0"
              style={{
                background: activeTab === tab ? "#0071e3" : "transparent",
                color: activeTab === tab ? "#ffffff" : "#6e6e73"
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        
        {/* TAB: PARTIDOS */}
        {activeTab === "Partidos" && (
          <div className="space-y-6">
            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedFilter(g)}
                  className="h-10 px-4 rounded-full text-[13px] font-bold shrink-0 transition-colors border"
                  style={{
                    background: selectedFilter === g ? "#0071e3" : "#ffffff",
                    color: selectedFilter === g ? "#ffffff" : "#1d1d1f",
                    borderColor: selectedFilter === g ? "#0071e3" : "rgba(0,0,0,0.08)"
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Matches List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {filteredMatches.map(match => (
                <PredictionMatchCard
                  key={match.id}
                  match={match}
                  homeScore={scores[match.id]?.home ?? ""}
                  awayScore={scores[match.id]?.away ?? ""}
                  onScoreChange={(type, val) => handleScoreChange(match.id, type, val)}
                  isSaved={!hasUnsavedChanges && typeof scores[match.id]?.home === "number"}
                />
              ))}
              {filteredMatches.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#6e6e73] font-medium">
                  No hay partidos en esta categoría.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: GRUPOS */}
        {activeTab === "Grupos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Visual Cards */}
            {["A", "B", "C", "D", "E", "F"].map(group => (
              <PremiumCard key={group} className="!p-5">
                <h3 className="font-display font-extrabold text-[#1d1d1f] text-[18px] mb-4">Grupo {group}</h3>
                <div className="w-full text-left">
                  <div className="grid grid-cols-[1fr_24px_24px_24px_28px] gap-2 text-[10px] text-[#aeaeb2] font-bold uppercase tracking-wider mb-2 pb-2 border-b border-[rgba(0,0,0,0.06)]">
                    <span>Equipo</span>
                    <span className="text-center">J</span>
                    <span className="text-center">G</span>
                    <span className="text-center">E</span>
                    <span className="text-right">Pts</span>
                  </div>
                  {[1,2,3,4].map(row => (
                    <div key={row} className="grid grid-cols-[1fr_24px_24px_24px_28px] gap-2 items-center py-2 text-[13px] font-medium text-[#1d1d1f]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#f5f5f7] rounded-full border border-[rgba(0,0,0,0.06)]"></div>
                        <span>Por definir</span>
                      </div>
                      <span className="text-center text-[#6e6e73]">0</span>
                      <span className="text-center text-[#6e6e73]">0</span>
                      <span className="text-center text-[#6e6e73]">0</span>
                      <span className="text-right font-bold">0</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* TAB: GOLEADOR */}
        {activeTab === "Goleador" && (
          <div className="max-w-2xl mx-auto">
            <PremiumCard className="!p-8 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-[#0071e3] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
              <h2 className="font-display font-extrabold text-[24px] text-[#1d1d1f] mb-2">Elegí tu goleador del torneo</h2>
              <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-6">
                Los planteles oficiales todavía están en revisión. Podés dejar este campo pendiente y completarlo más adelante.
              </p>
              <div className="w-full max-w-sm mx-auto p-4 bg-[#f5f5f7] rounded-[18px] border border-[rgba(0,0,0,0.06)] text-[#aeaeb2] font-medium flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">search</span>
                Buscar jugador...
              </div>
            </PremiumCard>
          </div>
        )}

      </div>

      <PredictionStickyBar 
        isVisible={hasUnsavedChanges}
        isSaving={isSaving}
        isLoggedIn={isLoggedIn}
        onSave={handleSave}
        onLoginRequest={() => setShowModal(true)}
      />

      {/* Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-[400px] p-8 shadow-xl border border-[rgba(0,0,0,0.08)]">
            <div className="w-14 h-14 bg-[#e8f0fd] rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[#0071e3] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                save
              </span>
            </div>
            <h3 className="font-display font-extrabold text-[#1d1d1f] text-[22px] tracking-tight mb-2">Guardá tu Mundial</h3>
            <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-8">
              Para guardar tu predicción y competir en el ranking con tus amigos, necesitás iniciar sesión en tu cuenta.
            </p>
            <div className="space-y-3">
              <Link href="/login" className="flex items-center justify-center w-full h-14 bg-[#0071e3] text-white font-bold text-[15px] rounded-full hover:bg-[#0077ed] transition-all active:scale-[0.98] shadow-sm">
                Iniciar sesión
              </Link>
              <button onClick={() => setShowModal(false)} className="flex items-center justify-center w-full h-14 bg-white text-[#1d1d1f] border border-[#e5e5e7] font-bold text-[15px] rounded-full hover:bg-[#f5f5f7] transition-all active:scale-[0.98]">
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
