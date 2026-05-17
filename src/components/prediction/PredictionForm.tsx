"use client";

import React, { useState } from "react";
import Link from "next/link";
import { saveUserPredictions } from "@/app/actions/predictions";
import type { Match } from "@/lib/worldcup/matches";

type ScoreValue = number | "";
type LocalScore = { home: ScoreValue; away: ScoreValue; };

interface PredictionFormProps {
  matches: Match[];
  isLoggedIn: boolean;
  initialScores?: Record<number, { home: number; away: number }>;
}

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

  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleScoreChange = (matchId: number, type: 'home' | 'away', val: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [type]: val === "" ? "" : Math.max(0, parseInt(val, 10) || 0)
      }
    }));
    setSaveStatus('idle'); // clear success msg on edit
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    const payload = Object.entries(scores)
      .filter(([_, score]) => typeof score.home === "number" && typeof score.away === "number")
      .map(([matchIdStr, score]) => ({
        match_id: parseInt(matchIdStr, 10),
        home_goals: score.home as number,
        away_goals: score.away as number
      }));

    if (payload.length === 0) {
      setSaveStatus('success');
      setIsSaving(false);
      return;
    }

    const result = await saveUserPredictions(payload);

    if (result.success) {
      setSaveStatus('success');
    } else {
      setSaveStatus('error');
      console.error(result.error);
    }
    
    setIsSaving(false);
  };

  return (
    <>
      <div className="space-y-3">
        {matches.map((match) => {
          const sanitizeLabel = (label: string | null) => {
            if (!label) return null;
            if (label.match(/^[Ww]\d{1,2}$/)) return null;
            return label;
          };

          const homeName = match.home_team || sanitizeLabel(match.home_origin_label) || sanitizeLabel(match.home_placeholder) || 'Por definir';
          const awayName = match.away_team || sanitizeLabel(match.away_origin_label) || sanitizeLabel(match.away_placeholder) || 'Por definir';
          
          const homeCode = match.home_team?.substring(0, 3).toUpperCase() || '?';
          const awayCode = match.away_team?.substring(0, 3).toUpperCase() || '?';
          
          const dateStr = match.kickoff_at 
            ? new Date(match.kickoff_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
            : 'Por definir';
            
          const currentScore = scores[match.id] || { home: "", away: "" };

          return (
            <div
              key={match.id}
              className="bg-white rounded-2xl border p-5 relative overflow-hidden shadow-sm"
              style={{ borderColor: match.is_knockout ? "#d4a63a40" : "rgba(0,0,0,0.06)" }}
            >
              {match.is_knockout && (
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-bl-xl"
                  style={{ background: "#f5ecd6", color: "#a07828" }}
                >
                  ⭐ Eliminatoria
                </div>
              )}

              <div className="text-center text-[11px] text-[#aeaeb2] uppercase tracking-widest mb-4">
                {dateStr}
              </div>

              <div className="flex items-center justify-between gap-3">
                {/* Home */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <span className="font-bold text-[#1d1d1f] text-sm text-center px-1" style={{ fontSize: homeCode.length > 3 ? '10px' : '14px' }}>
                      {homeCode}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#1d1d1f] font-medium text-center">{homeName}</span>
                </div>

                {/* Score inputs */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="-"
                    value={currentScore.home ?? ""}
                    onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                    className="w-12 h-12 bg-[#f5f5f7] border rounded-xl text-center text-xl font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-colors"
                    style={{ borderColor: "rgba(0,0,0,0.10)" }}
                  />
                  <span className="text-[#d1d1d6] font-bold text-xl">:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="-"
                    value={currentScore.away ?? ""}
                    onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                    className="w-12 h-12 bg-[#f5f5f7] border rounded-xl text-center text-xl font-bold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-colors"
                    style={{ borderColor: "rgba(0,0,0,0.10)" }}
                  />
                </div>

                {/* Away */}
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    <span className="font-bold text-[#1d1d1f] text-sm text-center px-1" style={{ fontSize: awayCode.length > 3 ? '10px' : '14px' }}>
                      {awayCode}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#1d1d1f] font-medium text-center">{awayName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 bg-[#0071e3] text-white font-semibold text-[15px] rounded-full hover:bg-[#0077ed] transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-sm"
        >
          {isSaving ? "Guardando..." : "Guardar predicciones"}
        </button>
        {saveStatus === 'success' && (
          <p className="text-center text-[#34a853] text-[13px] font-medium">¡Predicciones guardadas correctamente!</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-center text-[#ff3b30] text-[13px] font-medium">Error al guardar. Intentá de nuevo.</p>
        )}
        <p className="text-center text-[#aeaeb2] text-[12px]">
          Podés editar hasta que comience el torneo.
        </p>
      </div>

      {/* Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-xl border border-[#e5e5e7]">
            <div className="w-12 h-12 bg-[#e8f0fd] rounded-2xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#0071e3] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                save
              </span>
            </div>
            <h3 className="font-display font-bold text-[#1d1d1f] text-xl mb-2">Guardá tu predicción</h3>
            <p className="text-[#6e6e73] text-[15px] mb-8">
              Para guardar tu Mundial en tu cuenta y competir por premios, necesitás iniciar sesión.
            </p>
            <div className="space-y-3">
              <Link href="/login" className="flex items-center justify-center w-full h-12 bg-[#0071e3] text-white font-semibold text-[15px] rounded-full hover:bg-[#0077ed] transition-all active:scale-[0.98] shadow-sm">
                Iniciar sesión
              </Link>
              <button onClick={() => setShowModal(false)} className="flex items-center justify-center w-full h-12 bg-white text-[#1d1d1f] border border-[#e5e5e7] font-semibold text-[15px] rounded-full hover:bg-[#f5f5f7] transition-all active:scale-[0.98]">
                Seguir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
