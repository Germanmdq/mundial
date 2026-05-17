"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { saveUserPredictions } from "@/app/actions/predictions";
import type { Match } from "@/lib/worldcup/matches";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { getTeamDisplayName, getTeamCode, getTeamFlag } from "@/lib/worldcup/team-display-names";

const SHOULD_GATE_AFTER_SIX_MATCHES = false;
const PREDICTION_DRAFT_KEY = "worldcup_prediction_draft";
const PREDICTION_RETURN_PATH_KEY = "worldcup_prediction_return_path";

type LocalScore = { home: number; away: number; };
type DraftPredictionItem = { matchId: number; homeScore: number; awayScore: number; updatedAt: string; };
type PredictionDraft = {
  scores: Record<number, LocalScore>;
  completedMatchIds: number[];
  currentMatchIndex: number;
  selectedGroup: string;
  updatedAt: string;
};

interface PredictionFormProps {
  matches: Match[];
  isLoggedIn: boolean;
  initialScores?: Record<number, { home: number; away: number }>;
}

const TABS = ["Partidos", "Grupos", "Goleador"] as const;
type TabOption = typeof TABS[number];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Guardando...":
      return "#0071e3";
    case "Guardado":
      return "#34a853";
    case "Borrador local":
      return "#8e8e93";
    case "Error al guardar":
      return "#df3a30";
    default:
      return "#8e8e93";
  }
};

const getScoreValue = (value: number | undefined | null): number => {
  return typeof value === "number" ? value : 0;
};

const parseDraft = (rawDraft: string | null): PredictionDraft | null => {
  if (!rawDraft) return null;

  try {
    const parsed = JSON.parse(rawDraft) as PredictionDraft | DraftPredictionItem[];

    if (Array.isArray(parsed)) {
      const scores = parsed.reduce((acc, item) => {
        if (item.matchId) {
          acc[item.matchId] = {
            home: getScoreValue(item.homeScore),
            away: getScoreValue(item.awayScore),
          };
        }
        return acc;
      }, {} as Record<number, LocalScore>);

      return {
        scores,
        completedMatchIds: Object.keys(scores).map(Number),
        currentMatchIndex: 0,
        selectedGroup: "Todos",
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      scores: parsed.scores ?? {},
      completedMatchIds: Array.isArray(parsed.completedMatchIds) ? parsed.completedMatchIds : [],
      currentMatchIndex: typeof parsed.currentMatchIndex === "number" ? parsed.currentMatchIndex : 0,
      selectedGroup: typeof parsed.selectedGroup === "string" ? parsed.selectedGroup : "Todos",
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

const buildDraftItems = (draft: PredictionDraft): DraftPredictionItem[] => {
  return draft.completedMatchIds
    .map((matchId) => {
      const score = draft.scores[matchId];
      if (!score) return null;
      return {
        matchId,
        homeScore: getScoreValue(score.home),
        awayScore: getScoreValue(score.away),
        updatedAt: draft.updatedAt,
      };
    })
    .filter((item): item is DraftPredictionItem => Boolean(item));
};

export function PredictionForm({ matches, isLoggedIn, initialScores = {} }: PredictionFormProps) {
  const [scores, setScores] = useState<Record<number, LocalScore>>(() => {
    return matches.reduce((acc, match) => {
      const existing = initialScores[match.id];
      acc[match.id] = {
        home: typeof existing?.home === "number" ? existing.home : 0,
        away: typeof existing?.away === "number" ? existing.away : 0
      };
      return acc;
    }, {} as Record<number, LocalScore>);
  });

  const [completedMatchIds, setCompletedMatchIds] = useState<Set<number>>(() => {
    const ids = new Set<number>();
    Object.keys(initialScores).forEach(idStr => {
      ids.add(Number(idStr));
    });
    return ids;
  });

  const [saveStatus, setSaveStatus] = useState<string>(isLoggedIn ? "Guardado" : "Borrador local");
  const [activeTab, setActiveTab] = useState<TabOption>("Partidos");
  const [selectedFilter, setSelectedFilter] = useState<string>("Todos");
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [showCompletionCard, setShowCompletionCard] = useState<boolean>(false);
  
  // CTA modal / validation states
  const [ctaModalOpen, setCtaModalOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Sync guest draft to Supabase if they login
  const syncDraftToSupabase = async (draftItems: { matchId: number; homeScore: number; awayScore: number; }[]) => {
    const payload = draftItems
      .map(item => ({
        match_id: item.matchId,
        home_goals: item.homeScore,
        away_goals: item.awayScore
      }));

    if (payload.length > 0) {
      setSaveStatus("Guardando...");
      const result = await saveUserPredictions(payload);
      if (result.success) {
        setSaveStatus("Guardado");
        localStorage.removeItem("worldcup_prediction_draft");
      } else {
        setSaveStatus("Error al guardar");
      }
    }
  };

  const persistDraft = (
    nextScores = scores,
    nextCompletedMatchIds = completedMatchIds,
    nextCurrentMatchIndex = currentMatchIndex,
    nextSelectedGroup = selectedFilter,
  ) => {
    if (typeof window === "undefined" || isLoggedIn) return;

    const draft: PredictionDraft = {
      scores: Object.fromEntries(
        Array.from(nextCompletedMatchIds)
          .map((matchId) => [matchId, nextScores[matchId]])
          .filter(([, score]) => Boolean(score)),
      ) as Record<number, LocalScore>,
      completedMatchIds: Array.from(nextCompletedMatchIds),
      currentMatchIndex: nextCurrentMatchIndex,
      selectedGroup: nextSelectedGroup,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(PREDICTION_DRAFT_KEY, JSON.stringify(draft));
    localStorage.setItem(PREDICTION_RETURN_PATH_KEY, "/mi-prediccion");
  };

  // Load localStorage draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawDraft = localStorage.getItem(PREDICTION_DRAFT_KEY);
      const parsedDraft = parseDraft(rawDraft);
      if (parsedDraft) {
        setTimeout(() => {
          try {
            setScores(prev => {
              const updated = { ...prev };
              Object.entries(parsedDraft.scores).forEach(([matchId, score]) => {
                const id = Number(matchId);
                if (id && updated[id]) {
                  updated[id] = {
                    home: getScoreValue(score.home),
                    away: getScoreValue(score.away)
                  };
                }
              });
              return updated;
            });

            setCompletedMatchIds(prev => {
              const next = new Set(prev);
              parsedDraft.completedMatchIds.forEach(matchId => {
                if (matchId) {
                  next.add(matchId);
                }
              });
              return next;
            });

            setSelectedFilter(parsedDraft.selectedGroup || "Todos");
            setCurrentMatchIndex(Math.max(0, parsedDraft.currentMatchIndex || 0));

            // Sync draft to Supabase if now logged in
            const draftItems = buildDraftItems(parsedDraft);
            if (isLoggedIn && draftItems.length > 0) {
              syncDraftToSupabase(draftItems);
            }
          } catch {
            console.error("Error loading draft");
          }
        }, 0);
      }
    }
  }, [isLoggedIn]);

  // Group filter change - reset index and completion state
  const handleFilterChange = (filter: string) => {
    persistDraft(scores, completedMatchIds, 0, filter);
    setSelectedFilter(filter);
    setCurrentMatchIndex(0);
    setShowCompletionCard(false);
  };

  // Progress Panel Data
  const totalMatches = matches.length || 104;
  const completedMatches = completedMatchIds.size;

  const groupStats = useMemo(() => {
    if (!selectedFilter.startsWith("Grupo ")) return null;
    const letter = selectedFilter.replace("Grupo ", "").trim();
    const groupMatches = matches.filter(m => m.group_letter === letter);
    const total = groupMatches.length;
    const completed = groupMatches.filter(m => completedMatchIds.has(m.id)).length;
    return {
      name: selectedFilter,
      total,
      completed,
      remaining: total - completed
    };
  }, [matches, selectedFilter, completedMatchIds]);

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
    const numericVal = val === "" ? 0 : Math.max(0, parseInt(val, 10) || 0);
    const nextScores = {
      ...scores,
      [matchId]: {
        ...scores[matchId],
        [type]: numericVal
      }
    };
    const nextCompletedMatchIds = new Set(completedMatchIds);
    nextCompletedMatchIds.add(matchId);

    setScores(nextScores);
    setValidationMessage(null); // Clear error on edit
    setSaveStatus(isLoggedIn ? "Guardando..." : "Borrador local");
    setCompletedMatchIds(nextCompletedMatchIds);
    persistDraft(nextScores, nextCompletedMatchIds);
  };

  const handleIncrement = (matchId: number, side: 'home' | 'away') => {
    const currentVal = scores[matchId]?.[side];
    const currentNum = getScoreValue(currentVal);
    handleScoreChange(matchId, side, String(currentNum + 1));
  };

  const handleDecrement = (matchId: number, side: 'home' | 'away') => {
    const currentVal = scores[matchId]?.[side];
    const currentNum = getScoreValue(currentVal);
    handleScoreChange(matchId, side, String(Math.max(0, currentNum - 1)));
  };

  // Get active match info
  const activeMatch = filteredMatches[currentMatchIndex] || null;

  const handleNext = async () => {
    if (!activeMatch) return;

    const homeScore = getScoreValue(scores[activeMatch.id]?.home);
    const awayScore = getScoreValue(scores[activeMatch.id]?.away);

    setValidationMessage(null);
    setCompletedMatchIds(prev => {
      const next = new Set(prev);
      next.add(activeMatch.id);
      return next;
    });

    // Save Prediction
    if (isLoggedIn) {
      setSaveStatus("Guardando...");
      const payload = [{
        match_id: activeMatch.id,
        home_goals: homeScore,
        away_goals: awayScore
      }];

      const result = await saveUserPredictions(payload);
      if (result.success) {
        setSaveStatus("Guardado");
      } else {
        setSaveStatus("Error al guardar");
        alert("No se pudo guardar este partido. Probá de nuevo.");
        return; // Halt navigation
      }
    } else {
      // Local Draft Save
      setSaveStatus("Borrador local");
      const nextScores = {
        ...scores,
        [activeMatch.id]: { home: homeScore, away: awayScore },
      };
      const nextCompletedMatchIds = new Set(completedMatchIds);
      nextCompletedMatchIds.add(activeMatch.id);
      persistDraft(nextScores, nextCompletedMatchIds);
    }

    // CTA Check at 6th completed match
    const completedCount = completedMatchIds.has(activeMatch.id) 
      ? completedMatchIds.size 
      : completedMatchIds.size + 1;
    const ctaShown = localStorage.getItem("worldcup_prediction_cta_shown") === "true";
    const nextMatchIndex = currentMatchIndex < filteredMatches.length - 1 ? currentMatchIndex + 1 : currentMatchIndex;

    if (!isLoggedIn && completedCount >= 6 && !ctaShown) {
      const nextScores = {
        ...scores,
        [activeMatch.id]: { home: homeScore, away: awayScore },
      };
      const nextCompletedMatchIds = new Set(completedMatchIds);
      nextCompletedMatchIds.add(activeMatch.id);
      persistDraft(nextScores, nextCompletedMatchIds, nextMatchIndex);
      setCtaModalOpen(true);
      return;
    }

    // Navigate
    if (currentMatchIndex < filteredMatches.length - 1) {
      persistDraft(scores, completedMatchIds, currentMatchIndex + 1);
      setCurrentMatchIndex(prev => prev + 1);
    } else {
      persistDraft(scores, completedMatchIds, currentMatchIndex);
      setShowCompletionCard(true);
    }
  };

  const handlePrev = () => {
    if (showCompletionCard) {
      setShowCompletionCard(false);
    } else if (currentMatchIndex > 0) {
      setCurrentMatchIndex(prev => prev - 1);
    }
  };

  // Group completed predictions by group letter
  const groupedSummary = useMemo(() => {
    const groupsMap: Record<string, { match: Match; homeScore: number; awayScore: number; }[]> = {};

    matches.forEach(m => {
      if (completedMatchIds.has(m.id)) {
        const groupName = m.group_letter ? `Grupo ${m.group_letter}` : (m.stage_label || "Otros");
        if (!groupsMap[groupName]) {
          groupsMap[groupName] = [];
        }

        const homeScore = getScoreValue(scores[m.id]?.home);
        const awayScore = getScoreValue(scores[m.id]?.away);

        groupsMap[groupName].push({
          match: m,
          homeScore,
          awayScore
        });
      }
    });

    return Object.entries(groupsMap)
      .map(([groupName, list]) => ({
        groupName,
        matches: list
      }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [matches, scores, completedMatchIds]);

  // Tab change
  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
    setShowCompletionCard(false);
  };

  return (
    <div className="predictionContent space-y-8 pb-[120px] w-full max-w-full overflow-x-hidden">
      
      {/* Progress Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[980px] mx-auto text-center animate-fade-in">
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="text-[10px] text-[#aeaeb2] font-black uppercase tracking-wider mb-1">Partidos Completados</span>
          <span className="text-[24px] font-black text-[#1d1d1f] leading-none">
            {completedMatches} <span className="text-[16px] text-[#aeaeb2] font-extrabold">/ {totalMatches}</span>
          </span>
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="text-[10px] text-[#aeaeb2] font-black uppercase tracking-wider mb-1">Faltan</span>
          <span className="text-[24px] font-black text-[#1d1d1f] leading-none">
            {totalMatches - completedMatches} <span className="text-[14px] text-[#6e6e73] font-semibold">partidos</span>
          </span>
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="text-[10px] text-[#aeaeb2] font-black uppercase tracking-wider mb-1">Progreso</span>
          <span className="text-[24px] font-black text-[#0071e3] leading-none">
            {Math.round((completedMatches / totalMatches) * 100)}%
          </span>
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-4 shadow-sm flex flex-col justify-center items-center">
          <span className="text-[10px] text-[#aeaeb2] font-black uppercase tracking-wider mb-1">Estado</span>
          <span className="text-[14px] font-black leading-none" style={{ color: getStatusColor(saveStatus) }}>
            {saveStatus}
          </span>
        </div>

        {/* Human friendly global alert */}
        <div className="col-span-full mt-2 text-[14px] font-bold text-[#6e6e73]">
          {totalMatches - completedMatches > 0 
            ? `Faltan ${totalMatches - completedMatches} partidos para completar tu predicción.`
            : "¡Felicitaciones! Completaste todas tus predicciones del Mundial."
          }
        </div>

        {/* Group-specific active filter stats */}
        {groupStats && (
          <div className="col-span-full bg-[rgba(0,113,227,0.06)] border border-[rgba(0,113,227,0.12)] rounded-[14px] py-2.5 px-4 text-[13px] font-bold text-[#0071e3] mt-1 inline-flex items-center justify-center gap-1.5 mx-auto">
            <span>{groupStats.name}</span>
            <span className="text-[#8e8e93] font-medium">•</span>
            <span>{groupStats.completed} / {groupStats.total} cargados</span>
            <span className="text-[#8e8e93] font-medium">•</span>
            <span>{groupStats.remaining > 0 ? `Faltan ${groupStats.remaining} del grupo` : "Grupo completado"}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="w-full flex justify-center mt-6">
        <div className="inline-flex bg-[rgba(255,255,255,0.72)] border rounded-full p-1.5 shadow-sm overflow-x-auto max-w-full" style={{ borderColor: "rgba(0,0,0,0.08)", scrollbarWidth: "none" }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" style={{ scrollbarWidth: "none" }}>
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => handleFilterChange(g)}
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

            {filteredMatches.length === 0 ? (
              <div className="py-12 text-center text-[#6e6e73] font-medium">
                No hay partidos en esta categoría.
              </div>
            ) : ctaModalOpen ? (
              /* ZONA DE CONVERSIÓN CARD - INLINE (NON-BLOCKING) */
              <div className="conversionCard animate-fadeIn">
                <h2 className="text-3xl md:text-[44px] font-display font-black text-white mb-4 tracking-tight leading-tight">
                  Ya tenés tu Mundial en marcha.
                </h2>
                <p className="text-[rgba(255,255,255,0.72)] text-[16px] md:text-[18px] mb-8 leading-relaxed">
                  Creá tu cuenta para guardar tu predicción, participar por el premio acumulado, elegir goleador y campeón, y armar grupos privados con tus amigos.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0071e3] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-[15px] font-medium text-white">Guardás tu predicción completa.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0071e3] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-[15px] font-medium text-white">Participás por el premio acumulado.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0071e3] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-[15px] font-medium text-white">Competís por fase de grupos, goleador y campeón.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0071e3] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-[15px] font-medium text-white">Creás grupos privados con tus amigos.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0071e3] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-[15px] font-medium text-white">Seguís tu ranking durante todo el Mundial.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link 
                    href="/login?mode=signup&redirect=/mi-prediccion"
                    onClick={() => persistDraft(scores, completedMatchIds, currentMatchIndex, selectedFilter)}
                    className="flex items-center justify-center w-full h-[52px] bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold rounded-full transition-all active:scale-[0.98] text-[15px]"
                  >
                    Crear cuenta y participar
                  </Link>
                  
                  {!SHOULD_GATE_AFTER_SIX_MATCHES && (
                    <button 
                      onClick={() => {
                        localStorage.setItem("worldcup_prediction_cta_shown", "true");
                        persistDraft(scores, completedMatchIds, currentMatchIndex, selectedFilter);
                        setCtaModalOpen(false);
                        // Advance next
                        if (currentMatchIndex < filteredMatches.length - 1) {
                          setCurrentMatchIndex(prev => prev + 1);
                        } else {
                          setShowCompletionCard(true);
                        }
                      }}
                      className="flex items-center justify-center w-full h-[52px] bg-transparent hover:bg-[rgba(255,255,255,0.06)] text-white border border-[rgba(255,255,255,0.18)] font-bold rounded-full transition-all text-[15px]"
                    >
                      Seguir cargando por ahora
                    </button>
                  )}
                </div>
              </div>
            ) : showCompletionCard ? (
              /* ZONA DE GRUPOS COMPLETADA CARD */
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-[34px] border border-[rgba(0,0,0,0.08)] p-8 md:p-12 text-center shadow-lg">
                  <span className="material-symbols-outlined text-[64px] text-[#0071e3] mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                  </span>
                  <h2 className="text-3xl font-display font-extrabold text-[#1d1d1f] mb-4">Zona de grupos completada.</h2>
                  <p className="text-[#6e6e73] text-[16px] leading-relaxed mb-8 max-w-lg mx-auto">
                    Ya cargaste la primera parte de tu Mundial. Ahora podés activar tu participación por el premio acumulado, elegir goleador y campeón, y competir en el ranking general.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/premios" className="bg-[#0071e3] text-white px-6 py-3 rounded-full text-[15px] font-bold hover:bg-[#0077ed] transition-all justify-center items-center flex">
                      Participar por el premio
                    </Link>
                    <button onClick={() => handleTabChange("Goleador")} className="bg-white text-[#1d1d1f] border border-[rgba(0,0,0,0.15)] px-6 py-3 rounded-full text-[15px] font-bold hover:bg-[#f5f5f7] transition-all">
                      Elegir goleador
                    </button>
                    <button onClick={() => handleTabChange("Goleador")} className="bg-white text-[#1d1d1f] border border-[rgba(0,0,0,0.15)] px-6 py-3 rounded-full text-[15px] font-bold hover:bg-[#f5f5f7] transition-all">
                      Elegir campeón
                    </button>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[rgba(0,0,0,0.06)]">
                    <button onClick={handlePrev} className="text-[#0071e3] text-[14px] font-bold hover:underline">
                      ← Volver a revisar partidos
                    </button>
                  </div>
                </div>
              </div>
            ) : activeMatch && (
              /* SINGLE MATCH WIZARD FLOW */
              <div className="predictionSingleFlow">
                
                {/* Progress Header */}
                <div className="progressHeader">
                  <span className="progressLabel">
                    {selectedFilter === "Todos" 
                      ? `Partido ${currentMatchIndex + 1} de ${filteredMatches.length}`
                      : `${selectedFilter} · Partido ${currentMatchIndex + 1} de ${filteredMatches.length}`
                    }
                  </span>
                  <h2 className="progressTitle">
                    {getTeamDisplayName(activeMatch.home_team)} vs {getTeamDisplayName(activeMatch.away_team)}
                  </h2>
                  <div className="progressBar">
                    <div 
                      className="progressFill" 
                      style={{ width: `${((currentMatchIndex + 1) / filteredMatches.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Match Focus Card */}
                <div className="matchFocusCard">
                  <div className="matchFocusMeta">
                    <span className="matchFocusGroup">
                      {activeMatch.group_letter ? `Grupo ${activeMatch.group_letter}` : activeMatch.stage_label} · Fase de grupos
                    </span>
                    <span className="matchFocusTime">
                      {activeMatch.kickoff_at 
                        ? new Date(activeMatch.kickoff_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
                        : "Por definir"
                      }
                      {activeMatch.stadium_name ? ` · ${activeMatch.stadium_name}, ${activeMatch.city}` : ""}
                    </span>
                  </div>

                  <div className="matchFocusTeams">
                    {/* Home Team Row */}
                    <div className="focusTeam">
                      <div className="focusTeamInfo">
                        <div className="focusFlag flex items-center justify-center font-bold text-2xl shadow-inner">
                          {getTeamFlag(activeMatch.home_team) || "🏳️"}
                        </div>
                        <div>
                          <h3 className="focusTeamName">{getTeamDisplayName(activeMatch.home_team)}</h3>
                          <p className="focusTeamCode">{getTeamCode(activeMatch.home_team)}</p>
                        </div>
                      </div>
                      <div className="scoreStepper">
                        <button
                          type="button"
                          className="scoreButton"
                          onClick={() => handleDecrement(activeMatch.id, 'home')}
                          disabled={getScoreValue(scores[activeMatch.id]?.home) <= 0}
                          aria-label="Restar gol local"
                        >
                          −
                        </button>
                        <div className="scoreValue">
                          {getScoreValue(scores[activeMatch.id]?.home)}
                        </div>
                        <button
                          type="button"
                          className="scoreButton"
                          onClick={() => handleIncrement(activeMatch.id, 'home')}
                          aria-label="Sumar gol local"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="focusVs">VS</div>

                    {/* Away Team Row */}
                    <div className="focusTeam">
                      <div className="focusTeamInfo">
                        <div className="focusFlag flex items-center justify-center font-bold text-2xl shadow-inner">
                          {getTeamFlag(activeMatch.away_team) || "🏳️"}
                        </div>
                        <div>
                          <h3 className="focusTeamName">{getTeamDisplayName(activeMatch.away_team)}</h3>
                          <p className="focusTeamCode">{getTeamCode(activeMatch.away_team)}</p>
                        </div>
                      </div>
                      <div className="scoreStepper">
                        <button
                          type="button"
                          className="scoreButton"
                          onClick={() => handleDecrement(activeMatch.id, 'away')}
                          disabled={getScoreValue(scores[activeMatch.id]?.away) <= 0}
                          aria-label="Restar gol visitante"
                        >
                          −
                        </button>
                        <div className="scoreValue">
                          {getScoreValue(scores[activeMatch.id]?.away)}
                        </div>
                        <button
                          type="button"
                          className="scoreButton"
                          onClick={() => handleIncrement(activeMatch.id, 'away')}
                          aria-label="Sumar gol visitante"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation message warning */}
                {validationMessage && (
                  <div className="flex items-center justify-center gap-2 text-[#df3a30] text-[14px] font-bold mt-5 animate-bounce-slow">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {validationMessage}
                  </div>
                )}

                {/* Flow Navigation Actions */}
                <div className="flowActions">
                  <button
                    onClick={handlePrev}
                    disabled={currentMatchIndex === 0}
                    className="flowButton bg-white border border-[rgba(0,0,0,0.15)] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={handleNext}
                    className="flowButton bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all"
                  >
                    {currentMatchIndex === filteredMatches.length - 1 ? "Ver resumen" : "Siguiente"}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB: GRUPOS */}
        {activeTab === "Grupos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(group => (
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

      {/* DETAILED PREDICTIONS SUMMARY AGRUPADO POR GRUPO */}
      <section className="predictionSummary">
        <h2 className="summaryTitle">Tus predicciones</h2>
        <p className="summarySubtitle">Así va quedando tu Mundial.</p>

        {groupedSummary.length > 0 ? (
          <div className="summaryGroups">
            {groupedSummary.map(g => (
              <div key={g.groupName} className="summaryGroup">
                <h3 className="summaryGroupTitle">{g.groupName}</h3>
                <div className="summaryMatches">
                  {g.matches.map(item => (
                    <div key={item.match.id} className="summaryMatch">
                      <div className="summaryTeam">
                        <span className="mr-1">{getTeamFlag(item.match.home_team)}</span>
                        <span className="truncate">{getTeamDisplayName(item.match.home_team)}</span>
                      </div>
                      <div className="summaryScore">
                        {item.homeScore} - {item.awayScore}
                      </div>
                      <div className="summaryTeam summaryTeamAway">
                        <span className="truncate">{getTeamDisplayName(item.match.away_team)}</span>
                        <span className="ml-1">{getTeamFlag(item.match.away_team)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="summaryEmpty">Todavía no cargaste partidos. Empezá por el primero.</div>
        )}
      </section>

      {/* CSS STYLES FOR THE WIZARD */}
      <style jsx>{`
        .predictionSingleFlow {
          width: min(820px, calc(100vw - 32px));
          margin: 0 auto;
        }

        .progressHeader {
          margin: 32px auto 18px;
          text-align: center;
        }

        .progressLabel {
          color: #6e6e73;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .progressTitle {
          margin-top: 8px;
          color: #1d1d1f;
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 850;
          letter-spacing: -0.045em;
        }

        .progressBar {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(0,0,0,0.08);
          overflow: hidden;
          margin-top: 18px;
        }

        .progressFill {
          height: 100%;
          border-radius: inherit;
          background: #0071e3;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .matchFocusCard {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 34px;
          padding: 34px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.08);
        }

        .matchFocusMeta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 34px;
        }

        .matchFocusGroup {
          color: #0071e3;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .matchFocusTime {
          color: #6e6e73;
          font-size: 14px;
          font-weight: 700;
        }

        .matchFocusTeams {
          display: grid;
          grid-template-columns: 1fr;
          gap: 26px;
        }

        .focusTeam {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 22px;
        }

        .focusTeamInfo {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }

        .focusFlag {
          width: 62px;
          height: 62px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.08);
          background: #f5f5f7;
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }

        .focusTeamName {
          margin: 0;
          color: #1d1d1f;
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 850;
          letter-spacing: -0.045em;
          line-height: 1.02;
        }

        .focusTeamCode {
          margin: 5px 0 0;
          color: #6e6e73;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .focusVs {
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .scoreStepper {
          display: grid;
          grid-template-columns: 48px 72px 48px;
          align-items: center;
          gap: 10px;
        }

        .scoreButton {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.10);
          background: #ffffff;
          color: #1d1d1f;
          font-size: 26px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.1s, background 0.1s;
        }

        .scoreButton:active {
          transform: scale(0.92);
        }

        .scoreButton:disabled {
          opacity: 0.35;
          pointer-events: none;
        }

        .scoreValue {
          width: 72px;
          height: 64px;
          border-radius: 20px;
          background: #f5f5f7;
          border: 1px solid rgba(0,0,0,0.10);
          color: #1d1d1f;
          font-size: 34px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .flowActions {
          width: min(820px, calc(100vw - 32px));
          margin: 24px auto 0;
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .flowButton {
          height: 52px;
          padding: 0 28px;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .flowButton:active {
          transform: scale(0.98);
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* CONVERSION CARD INLINE */
        .conversionCard {
          width: min(820px, calc(100vw - 32px));
          margin: 0 auto;
          background: #111827;
          color: #fff;
          border-radius: 34px;
          padding: 40px;
          box-shadow: 0 22px 70px rgba(0,0,0,0.20);
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* PREDICTION SUMMARY STYLES */
        .predictionSummary {
          width: min(820px, calc(100vw - 32px));
          margin: 42px auto 0;
        }

        .summaryTitle {
          font-size: 28px;
          font-weight: 850;
          letter-spacing: -0.04em;
          color: #1d1d1f;
        }

        .summarySubtitle {
          margin-top: 6px;
          color: #6e6e73;
          font-size: 15px;
          font-weight: 600;
        }

        .summaryGroup {
          margin-top: 18px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.05);
        }

        .summaryEmpty {
          margin-top: 18px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 24px;
          padding: 22px;
          color: #6e6e73;
          font-size: 15px;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 8px 28px rgba(0,0,0,0.05);
        }

        .summaryGroupTitle {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0071e3;
          margin-bottom: 12px;
        }

        .summaryMatch {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid rgba(0,0,0,0.06);
        }

        .summaryMatch:first-of-type {
          border-top: 0;
        }

        .summaryTeam {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          font-size: 14px;
          font-weight: 750;
          color: #1d1d1f;
        }

        .summaryTeamAway {
          justify-content: flex-end;
          text-align: right;
        }

        .summaryScore {
          min-width: 58px;
          height: 32px;
          border-radius: 999px;
          background: #f5f5f7;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          color: #1d1d1f;
        }

        @media (max-width: 734px) {
          .predictionSingleFlow {
            width: calc(100vw - 28px);
          }

          .matchFocusCard {
            padding: 22px 16px;
            border-radius: 28px;
          }

          .matchFocusMeta {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-bottom: 26px;
            text-align: center;
          }

          .focusTeam {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
            gap: 14px;
          }

          .focusTeamInfo {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .focusFlag {
            width: 58px;
            height: 58px;
          }

          .focusTeamName {
            font-size: 28px;
          }

          .scoreStepper {
            grid-template-columns: 46px 68px 46px;
            gap: 9px;
          }

          .scoreButton {
            width: 46px;
            height: 46px;
          }

          .scoreValue {
            width: 68px;
            height: 60px;
            font-size: 32px;
          }

          .flowActions {
            width: calc(100vw - 28px);
          }

          .flowButton {
            flex: 1;
            height: 50px;
            padding: 0 16px;
          }

          /* SUMMARY MOBILE */
          .predictionSummary {
            width: calc(100vw - 28px);
          }

          .summaryGroup {
            padding: 16px;
            border-radius: 22px;
          }

          .summaryMatch {
            grid-template-columns: 1fr;
            gap: 6px;
            text-align: center;
          }

          .summaryTeam,
          .summaryTeamAway {
            justify-content: center;
            text-align: center;
          }

          .summaryScore {
            margin: 2px auto;
          }
        }
      `}</style>

    </div>
  );
}
