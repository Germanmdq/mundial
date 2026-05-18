"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { Match } from "@/lib/worldcup/matches";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { getTeamDisplayName, getTeamCode, getTeamFlag } from "@/lib/worldcup/team-display-names";
import { formatMatchDate } from "@/lib/worldcup/match-date";
import { PrizePaymentOptions } from "@/components/payments/PrizePaymentOptions";

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

const TABS = ["Partidos", "Grupos"] as const;
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
    case "Participación activa":
      return "#0071e3";
    default:
      return "#8e8e93";
  }
};

const getScoreValue = (value: number | undefined | null): number => {
  return typeof value === "number" ? value : 0;
};

const hasCompleteScore = (score: { home?: number | null; away?: number | null } | undefined | null) => {
  return (
    score !== undefined
    && score !== null
    && score.home !== null
    && score.home !== undefined
    && score.away !== null
    && score.away !== undefined
  );
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

  const [hasMounted, setHasMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("Preparando predicción");
  const [paymentStatus, setPaymentStatus] = useState<"borrador" | "pendiente" | "activo">("borrador");
  const [activeTab, setActiveTab] = useState<TabOption>("Partidos");
  const [selectedFilter, setSelectedFilter] = useState<string>("Todos");
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(() => {
    const firstIncompleteIdx = matches.findIndex(m => {
      const existing = initialScores[m.id];
      return !hasCompleteScore(existing);
    });
    return firstIncompleteIdx === -1 ? matches.length - 1 : firstIncompleteIdx;
  });
  const [showCompletionCard, setShowCompletionCard] = useState<boolean>(() => {
    if (Object.keys(initialScores).length === 0) return false;
    const allComplete = matches.every(m => {
      const existing = initialScores[m.id];
      return hasCompleteScore(existing);
    });
    return allComplete;
  });
  
  const [isPaymentStatusLoading, setIsPaymentStatusLoading] = useState<boolean>(isLoggedIn);
  const [debugPayments, setDebugPayments] = useState<boolean>(false);
  const [debugPrediction, setDebugPrediction] = useState<boolean>(false);
  const [debugEmail, setDebugEmail] = useState<string>("");
  const [debugPartStatus, setDebugPartStatus] = useState<string>("");
  const [debugPaid, setDebugPaid] = useState<boolean>(false);
  const [debugPaymentStatusField, setDebugPaymentStatusField] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debugPayments") === "1" || params.has("debugPayments")) {
        setTimeout(() => setDebugPayments(true), 0);
      }
      if (params.get("debugPrediction") === "1" || params.has("debugPrediction")) {
        setTimeout(() => setDebugPrediction(true), 0);
      }
    }
  }, []);

  const [ctaModalOpen, setCtaModalOpen] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);



  const persistDraft = (
    nextScores = scores,
    nextCompletedMatchIds = completedMatchIds,
    nextCurrentMatchIndex = currentMatchIndex,
    nextSelectedGroup = selectedFilter,
  ) => {
    if (typeof window === "undefined" || (isLoggedIn && paymentStatus === "activo")) return;

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

  const loadOfficialPredictions = async (allMatches: Match[]) => {
    try {
      const res = await fetch("/api/predictions/me");
      if (res.ok) {
        const data = await res.json();
        const scoresList = data.scores;
        if (Array.isArray(scoresList)) {
          const officialScores: Record<number, LocalScore> = {};
          const officialCompletedIds = new Set<number>();
          const validMatchIds = new Set(allMatches.map((match) => Number(match.id)));
          
          scoresList.forEach((p: { matchId: string | number; homeScore: number; awayScore: number }) => {
            const mId = Number(p.matchId);
            if (mId && validMatchIds.has(mId)) {
              officialScores[mId] = {
                home: p.homeScore,
                away: p.awayScore
              };
              officialCompletedIds.add(mId);
            }
          });

          const nextScores = allMatches.reduce((acc, match) => {
            const existing = officialScores[match.id];
            acc[match.id] = {
              home: typeof existing?.home === "number" ? existing.home : 0,
              away: typeof existing?.away === "number" ? existing.away : 0,
            };
            return acc;
          }, {} as Record<number, LocalScore>);
          
          setScores(nextScores);
          setCompletedMatchIds(officialCompletedIds);
          
          // Find first incomplete match index
          const firstIncompleteIdx = allMatches.findIndex(m => !hasCompleteScore(officialScores[m.id]));
          if (firstIncompleteIdx !== -1) {
            setCurrentMatchIndex(firstIncompleteIdx);
            setShowCompletionCard(false);
          } else {
            setCurrentMatchIndex(allMatches.length - 1);
            setShowCompletionCard(true);
          }
          return officialCompletedIds;
        }
      }
    } catch (e) {
      console.error("Error loading official predictions", e);
    }
    return null;
  };

  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setHasMounted(true);
      if (!isLoggedIn) {
        setSaveStatus("Borrador temporal");
      }
    }, 0);

    if (isLoggedIn) {
      setTimeout(() => setIsPaymentStatusLoading(true), 0);
      fetch("/api/payments/status")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then(async (data) => {
          const part = data.participation;
          const statusVal = part?.status || data.status || "";
          const paidVal = part?.paid || data.paid || false;
          const payStatusVal = part?.payment_status || data.payment_status || "";
          
          setDebugEmail(data.email || data.user_email || "");
          setDebugPartStatus(statusVal);
          setDebugPaid(paidVal);
          setDebugPaymentStatusField(payStatusVal);

          const isActive = statusVal === "active" && paidVal === true && payStatusVal === "approved";
          
          if (isActive) {
            setPaymentStatus("activo");
            setSaveStatus("Participación activa");
            await loadOfficialPredictions(matches);
            localStorage.removeItem(PREDICTION_DRAFT_KEY);
          } else {
            if (statusVal === "pending" || statusVal === "pending_payment") {
              setPaymentStatus("pendiente");
              setSaveStatus("Borrador temporal");
            } else {
              setPaymentStatus("borrador");
              setSaveStatus("Borrador temporal");
            }
          }
          setIsPaymentStatusLoading(false);
        })
        .catch((e) => {
          console.error("Error checking payment status on mount", e);
          setPaymentStatus("borrador");
          setSaveStatus("Borrador temporal");
          setIsPaymentStatusLoading(false);
        });
    }

    return () => window.clearTimeout(mountTimer);
  }, [isLoggedIn, matches]);

  // Load localStorage draft after mount only, so hydration starts from deterministic server markup.
  useEffect(() => {
    if (!hasMounted) return;
    if (isPaymentStatusLoading) return; // Wait for payment status check to complete
    if (paymentStatus === "activo") return; // Active user uses official database

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

            const localCompletedIds = new Set<number>();
            parsedDraft.completedMatchIds.forEach(matchId => {
              if (matchId) {
                localCompletedIds.add(matchId);
              }
            });

            setCompletedMatchIds(prev => {
              const next = new Set(prev);
              localCompletedIds.forEach(id => next.add(id));
              return next;
            });

            setSelectedFilter(parsedDraft.selectedGroup || "Todos");
            
            // Guest/non-active rule: min(localDraftFirstIncomplete, 5)
            const firstIncompleteIdx = matches.findIndex(m => !localCompletedIds.has(m.id));
            const localFirstIncomplete = firstIncompleteIdx === -1 ? matches.length - 1 : firstIncompleteIdx;
            setCurrentMatchIndex(Math.min(localFirstIncomplete, 5));

            if (parsedDraft.completedMatchIds.filter(Boolean).length >= 6) {
              setCtaModalOpen(true);
            }
          } catch {
            console.error("Error loading draft");
          }
        }, 0);
      }
    }
  }, [hasMounted, isPaymentStatusLoading, paymentStatus, matches]);


  // Progress Panel Data
  const totalMatches = matches.length || 72;
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


  const filteredMatches = useMemo(() => {
    if (selectedFilter === "Todos") return matches;
    if (selectedFilter.startsWith("Grupo ")) {
      const letter = selectedFilter.replace("Grupo ", "");
      return matches.filter(m => m.group_letter === letter);
    }
    return matches;
  }, [matches, selectedFilter]);

  const firstIncompleteIndex = useMemo(() => {
    return matches.findIndex((match) => !completedMatchIds.has(match.id));
  }, [matches, completedMatchIds]);

  const initialScoresCount = useMemo(() => {
    return matches.filter((match) => hasCompleteScore(initialScores[match.id])).length;
  }, [matches, initialScores]);

  const groupTables = useMemo(() => {
    const tables: Record<string, Record<string, {
      name: string;
      pj: number;
      g: number;
      e: number;
      p: number;
      gf: number;
      gc: number;
      dg: number;
      pts: number;
    }>> = {};

    const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    groupLetters.forEach(letter => {
      tables[letter] = {};
    });

    // Seed teams from matches
    matches.forEach(m => {
      if (!m.group_letter || !m.home_team || !m.away_team) return;
      const g = m.group_letter.toUpperCase();
      if (!tables[g]) tables[g] = {};
      
      if (!tables[g][m.home_team]) {
        tables[g][m.home_team] = { name: m.home_team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
      }
      if (!tables[g][m.away_team]) {
        tables[g][m.away_team] = { name: m.away_team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
      }
    });

    // Calculate predictions
    matches.forEach(m => {
      if (!m.group_letter || !m.home_team || !m.away_team) return;
      const g = m.group_letter.toUpperCase();
      
      if (completedMatchIds.has(m.id)) {
        const pred = scores[m.id];
        const hGoals = pred?.home !== undefined ? pred.home : 0;
        const aGoals = pred?.away !== undefined ? pred.away : 0;

        const hStats = tables[g][m.home_team];
        const aStats = tables[g][m.away_team];

        if (hStats && aStats) {
          hStats.pj += 1;
          aStats.pj += 1;
          hStats.gf += hGoals;
          hStats.gc += aGoals;
          aStats.gf += aGoals;
          aStats.gc += hGoals;

          if (hGoals > aGoals) {
            hStats.g += 1;
            hStats.pts += 3;
            aStats.p += 1;
          } else if (hGoals < aGoals) {
            aStats.g += 1;
            aStats.pts += 3;
            hStats.p += 1;
          } else {
            hStats.e += 1;
            hStats.pts += 1;
            aStats.e += 1;
            aStats.pts += 1;
          }

          hStats.dg = hStats.gf - hStats.gc;
          aStats.dg = aStats.gf - aStats.gc;
        }
      }
    });

    // Sort teams per group: Pts -> DG -> GF -> Name
    const sorted: Record<string, Array<{
      name: string;
      pj: number;
      g: number;
      e: number;
      p: number;
      gf: number;
      gc: number;
      dg: number;
      pts: number;
    }>> = {};

    groupLetters.forEach(letter => {
      const teams = Object.values(tables[letter] || {});
      teams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
      });
      sorted[letter] = teams;
    });

    return sorted;
  }, [matches, scores, completedMatchIds]);

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
    
    if (isLoggedIn && paymentStatus === "activo") {
      setSaveStatus("Participación activa");
    } else {
      setSaveStatus("Borrador temporal");
    }
    
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

    const matchScore = scores[activeMatch.id];
    const homeScore = matchScore ? matchScore.home : 0;
    const awayScore = matchScore ? matchScore.away : 0;

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      setValidationMessage("Por favor, ingresá goles válidos.");
      return;
    }

    setValidationMessage(null);
    setCompletedMatchIds(prev => {
      const next = new Set(prev);
      next.add(activeMatch.id);
      return next;
    });

    const nextScores = {
      ...scores,
      [activeMatch.id]: { home: homeScore, away: awayScore },
    };
    const nextCompletedMatchIds = new Set(completedMatchIds);
    nextCompletedMatchIds.add(activeMatch.id);

    // Save Prediction
    if (isLoggedIn && paymentStatus === "activo") {
      setSaveStatus("Guardando...");
      try {
        const res = await fetch("/api/predictions/save-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId: activeMatch.id,
            homeScore,
            awayScore
          })
        });

        if (res.ok) {
          setSaveStatus("Participación activa");
        } else {
          const errJson = await res.json().catch(() => ({}));
          console.error("[api:predictions:save-match] failed:", res.status, errJson);
          setSaveStatus("Error al guardar");
          setValidationMessage("No pudimos guardar tu predicción. Probá de nuevo.");
          return; // Halt navigation
        }
      } catch (e) {
        console.error("Exception during save-match", e);
        setSaveStatus("Error al guardar");
        setValidationMessage("No pudimos guardar tu predicción. Probá de nuevo.");
        return; // Halt navigation
      }
    } else {
      // Local Draft Save
      setSaveStatus("Borrador temporal");
      persistDraft(nextScores, nextCompletedMatchIds);
    }

    // Gating non-active users strictly at 6 matches
    if (paymentStatus !== "activo") {
      const completedCount = nextCompletedMatchIds.size;
      if (completedCount >= 6) {
        persistDraft(nextScores, nextCompletedMatchIds, currentMatchIndex);
        setCtaModalOpen(true);
        return;
      }
    }

    // Navigate
    if (currentMatchIndex < filteredMatches.length - 1) {
      persistDraft(nextScores, nextCompletedMatchIds, currentMatchIndex + 1);
      setCurrentMatchIndex(prev => prev + 1);
    } else {
      persistDraft(nextScores, nextCompletedMatchIds, currentMatchIndex);
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

  if (isLoggedIn && isPaymentStatusLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[#f5f5f7] rounded-[24px] border border-[rgba(0,0,0,0.06)] shadow-sm max-w-[980px] mx-auto my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0071e3] mb-4"></div>
        <p className="text-[16px] text-[#6e6e73] font-bold">Preparando predicción...</p>
      </div>
    );
  }

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
          {paymentStatus !== "activo" && (
            <span className="mt-1 text-[9px] text-[#8e8e93] text-center font-bold">
              Solo en este dispositivo
            </span>
          )}
        </div>

        {/* Human friendly global alert */}
        <div className="col-span-full mt-2 text-[14px] font-bold text-[#6e6e73]">
          {totalMatches - completedMatches > 0 
            ? `Faltan ${totalMatches - completedMatches} partidos para completar tu predicción.`
            : "¡Felicitaciones! Completaste todas tus predicciones del Mundial."
          }
        </div>

        {/* Premium warning banner for unpaid users */}
        {paymentStatus !== "activo" && (
          <div className="col-span-full mt-4 bg-[rgba(255,159,10,0.04)] border border-[rgba(255,159,10,0.12)] rounded-[20px] p-5 text-center flex flex-col justify-center items-center gap-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-[#ff9f0a] font-bold text-[14.5px]">
              <span className="text-[18px]">⚠️</span>
              <span>Borrador temporal</span>
            </div>
            <p className="text-[13px] text-[#6e6e73] font-medium leading-relaxed max-w-[640px] mx-auto">
              Se guarda solo en este dispositivo. Para guardar tu predicción oficial y competir por el premio acumulado, activá tu participación.
            </p>
          </div>
        )}

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
            {/* Filter Chips removed for a clean linear flow */}

            {filteredMatches.length === 0 ? (
              <div className="py-12 text-center text-[#6e6e73] font-medium">
                No hay partidos en esta categoría.
              </div>
            ) : ctaModalOpen ? (
              /* ZONA DE CONVERSIÓN CARD - INLINE (NON-BLOCKING) */
              <div className="conversionCard animate-fadeIn">
                <h2 className="text-3xl md:text-[44px] font-display font-black text-white mb-4 tracking-tight leading-tight">
                  Ya probaste tu Mundial.
                </h2>
                <p className="text-[rgba(255,255,255,0.72)] text-[16px] md:text-[18px] mb-8 leading-relaxed">
                  Para completar la fase de grupos, guardar tu predicción oficial y participar por el premio acumulado, activá tu participación.
                </p>
                
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  {isLoggedIn ? (
                    <Link 
                      href="/activar-participacion"
                      className="flex items-center justify-center w-full h-[52px] bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold rounded-full transition-all active:scale-[0.98] text-[15px]"
                    >
                      Activar participación
                    </Link>
                  ) : (
                    <Link 
                      href="/login?redirect=/activar-participacion"
                      onClick={() => persistDraft(scores, completedMatchIds, currentMatchIndex, selectedFilter)}
                      className="flex items-center justify-center w-full h-[52px] bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold rounded-full transition-all active:scale-[0.98] text-[15px]"
                    >
                      Activar participación
                    </Link>
                  )}
                  
                  <Link 
                    href="/reglas"
                    className="flex items-center justify-center w-full h-[52px] bg-transparent hover:bg-[rgba(255,255,255,0.06)] text-white border border-[rgba(255,255,255,0.18)] font-bold rounded-full transition-all text-[15px]"
                  >
                    Ver reglas
                  </Link>
                </div>
              </div>
            ) : showCompletionCard ? (
              /* ZONA DE GRUPOS COMPLETADA CARD */
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-[34px] border border-[rgba(0,0,0,0.08)] p-8 md:p-12 text-center shadow-lg">
                  <span className="material-symbols-outlined text-[64px] text-[#34a853] mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                  </span>
                  <h2 className="text-3xl font-display font-extrabold text-[#1d1d1f] mb-4">¡Fase de grupos completada!</h2>
                  <p className="text-[#6e6e73] text-[16px] leading-relaxed mb-8 max-w-lg mx-auto">
                    Ya cargaste tu predicción de la fase de grupos. Por ahora, completás los partidos de esta fase. Las eliminatorias, el campeón y el goleador se habilitarán en una segunda etapa.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {paymentStatus === "activo" ? (
                      <Link href="/cuenta" className="bg-[#0071e3] text-white px-6 py-3 rounded-full text-[15px] font-bold hover:bg-[#0077ed] transition-all justify-center items-center flex">
                        Ir a mi cuenta
                      </Link>
                    ) : (
                      <Link 
                        href={isLoggedIn ? "/activar-participacion" : "/login?redirect=/activar-participacion"}
                        onClick={() => persistDraft(scores, completedMatchIds, currentMatchIndex, selectedFilter)}
                        className="bg-[#0071e3] text-white px-6 py-3 rounded-full text-[15px] font-bold hover:bg-[#0077ed] transition-all justify-center items-center flex"
                      >
                        Activar mi participación
                      </Link>
                    )}
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
                      {formatMatchDate(activeMatch.kickoff_at, "long")}
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
          <div className="space-y-6 max-w-[980px] mx-auto animate-fadeIn">
            <div className="text-center md:text-left mb-2">
              <p className="text-[#6e6e73] text-[13.5px] font-bold">
                Tabla provisional según tus resultados cargados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(group => {
                const teams = groupTables[group] || [];
                return (
                  <PremiumCard key={group} className="!p-5">
                    <h3 className="font-display font-extrabold text-[#1d1d1f] text-[18px] mb-4">Grupo {group}</h3>
                    <div className="overflow-x-auto w-full hide-scrollbar">
                      <table className="w-full text-left border-collapse text-[12px] min-w-[320px]">
                        <thead>
                          <tr className="border-b border-[rgba(0,0,0,0.06)] text-[10px] text-[#aeaeb2] font-black uppercase tracking-wider">
                            <th className="py-2 pr-2">Equipo</th>
                            <th className="py-2 px-1 text-center">PJ</th>
                            <th className="py-2 px-1 text-center">G</th>
                            <th className="py-2 px-1 text-center">E</th>
                            <th className="py-2 px-1 text-center">P</th>
                            <th className="py-2 px-1 text-center">GF</th>
                            <th className="py-2 px-1 text-center">GC</th>
                            <th className="py-2 px-1 text-center">DG</th>
                            <th className="py-2 pl-2 text-right">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams.map((t, idx) => (
                            <tr key={t.name} className="border-b border-[rgba(0,0,0,0.02)] last:border-0 hover:bg-[rgba(0,0,0,0.01)] transition-colors">
                              <td className="py-2.5 pr-2 font-bold text-[#1d1d1f] flex items-center gap-1.5">
                                <span className="text-[#8e8e93] text-[10px] w-3 inline-block">{idx + 1}</span>
                                <span className="text-[16px]">{getTeamFlag(t.name) || "🏳️"}</span>
                                <span className="truncate max-w-[90px]">{getTeamDisplayName(t.name)}</span>
                              </td>
                              <td className="py-2.5 px-1 text-center text-[#6e6e73] font-semibold">{t.pj}</td>
                              <td className="py-2.5 px-1 text-center text-[#6e6e73]">{t.g}</td>
                              <td className="py-2.5 px-1 text-center text-[#6e6e73]">{t.e}</td>
                              <td className="py-2.5 px-1 text-center text-[#6e6e73]">{t.p}</td>
                              <td className="py-2.5 px-1 text-center text-[#aeaeb2]">{t.gf}</td>
                              <td className="py-2.5 px-1 text-center text-[#aeaeb2]">{t.gc}</td>
                              <td className="py-2.5 px-1 text-center text-[#aeaeb2] font-semibold">{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                              <td className="py-2.5 pl-2 text-right font-black text-[#1d1d1f] text-[13px]">{t.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Goleador tab removed */}

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

        @media (max-width: 768px) {
          .predictionSingleFlow {
            width: calc(100% - 24px);
            margin: 0 auto;
          }

          .matchFocusCard {
            width: 100%;
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
            border-radius: 28px;
            padding: 24px 18px;
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
            width: calc(100% - 24px);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-left: auto;
            margin-right: auto;
          }

          .flowButton {
            width: 100%;
            min-height: 52px;
            white-space: nowrap;
          }

          /* SUMMARY MOBILE */
          .predictionSummary {
            width: calc(100% - 24px);
            margin: 0 auto;
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
      {/* Payments Debug Panel */}
      {debugPayments && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1d1d1f] text-white border border-[rgba(255,255,255,0.15)] rounded-[20px] p-5 shadow-2xl max-w-sm font-sans text-[12px] space-y-3 animate-fadeIn backdrop-blur-md bg-opacity-95">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] pb-2">
            <span className="font-extrabold text-[13px] tracking-tight flex items-center gap-1.5 text-[#ff9f0a]">
              <span className="material-symbols-outlined text-[16px]">bug_report</span>
              Payments Debug Panel
            </span>
            <button 
              onClick={() => setDebugPayments(false)} 
              className="text-[#aeaeb2] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Logged In:</span>
              <span className={isLoggedIn ? "text-emerald-400 font-bold" : "text-rose-400"}>
                {isLoggedIn ? "Yes" : "No"}
              </span>
            </div>
            {isLoggedIn && (
              <div className="flex justify-between gap-4">
                <span className="text-[#aeaeb2]">Email:</span>
                <span className="text-white truncate max-w-[180px]">{debugEmail || "N/A"}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">API Status:</span>
              <span className="text-white font-bold">{debugPartStatus || "N/A"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">API Paid:</span>
              <span className={debugPaid ? "text-emerald-400 font-bold" : "text-[#aeaeb2]"}>
                {debugPaid ? "True" : "False"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">API Pay Status:</span>
              <span className="text-white font-bold">{debugPaymentStatusField || "N/A"}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[rgba(255,255,255,0.1)] pt-1.5">
              <span className="text-[#aeaeb2]">isActive Calc:</span>
              <span className={paymentStatus === "activo" ? "text-emerald-400 font-black" : "text-rose-400 font-bold"}>
                {paymentStatus === "activo" ? "ACTIVE" : "UNPAID"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Local Draft Count:</span>
              <span className="text-white">{completedMatches}</span>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Debug Panel */}
      {debugPrediction && (
        <div className="fixed bottom-4 left-4 z-50 bg-[#1d1d1f] text-white border border-[rgba(255,255,255,0.15)] rounded-[20px] p-5 shadow-2xl max-w-sm font-sans text-[12px] space-y-3 animate-fadeIn backdrop-blur-md bg-opacity-95">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] pb-2">
            <span className="font-extrabold text-[13px] tracking-tight flex items-center gap-1.5 text-[#34a853]">
              <span className="material-symbols-outlined text-[16px]">bug_report</span>
              Prediction Debug Panel
            </span>
            <button 
              onClick={() => setDebugPrediction(false)} 
              className="text-[#aeaeb2] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">isActive:</span>
              <span className={paymentStatus === "activo" ? "text-emerald-400 font-bold" : "text-rose-400"}>
                {paymentStatus === "activo" ? "ACTIVE" : "UNPAID"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">matchesLength:</span>
              <span className="text-white">{totalMatches}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">initialScoresCount:</span>
              <span className="text-white">{initialScoresCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">completedMatchIdsCount:</span>
              <span className="text-white">{completedMatchIds.size}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">paymentStatus:</span>
              <span className="text-white">{paymentStatus}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">isLoggedIn:</span>
              <span className="text-white">{isLoggedIn ? "true" : "false"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Current Index:</span>
              <span className="text-white">{currentMatchIndex}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Visible Match Number:</span>
              <span className="text-white">{currentMatchIndex + 1}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">First Incomplete Index:</span>
              <span className="text-white">{firstIncompleteIndex}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Has Goleador Tab:</span>
              <span className="text-rose-400 font-bold">false</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
