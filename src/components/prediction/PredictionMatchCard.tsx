"use client";

import React from "react";
import type { Match } from "@/lib/worldcup/matches";
import { getTeamDisplayName, getTeamCode, getTeamFlag } from "@/lib/worldcup/team-display-names";

interface PredictionMatchCardProps {
  match: Match;
  homeScore: number | "";
  awayScore: number | "";
  onScoreChange: (type: 'home' | 'away', val: string) => void;
  isSaved?: boolean;
}

export function PredictionMatchCard({ match, homeScore, awayScore, onScoreChange, isSaved }: PredictionMatchCardProps) {
  const sanitizeLabel = (label: string | null) => {
    if (!label) return null;
    if (label.match(/^[Ww]\d{1,2}$/)) return null;
    return label;
  };

  const rawHomeName = match.home_team || sanitizeLabel(match.home_origin_label) || sanitizeLabel(match.home_placeholder) || null;
  const rawAwayName = match.away_team || sanitizeLabel(match.away_origin_label) || sanitizeLabel(match.away_placeholder) || null;

  const homeName = getTeamDisplayName(rawHomeName);
  const awayName = getTeamDisplayName(rawAwayName);
  
  const homeCode = getTeamCode(rawHomeName);
  const awayCode = getTeamCode(rawAwayName);

  const homeFlag = getTeamFlag(rawHomeName);
  const awayFlag = getTeamFlag(rawAwayName);

  const dateStr = match.kickoff_at 
    ? new Date(match.kickoff_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
    : 'Por definir';

  const groupLabel = match.group_letter ? `Grupo ${match.group_letter}` : (match.stage_label || "Eliminatorias");

  const hasScore = typeof homeScore === "number" && typeof awayScore === "number";

  return (
    <div className="w-full bg-white rounded-[28px] p-6 border shadow-sm transition-all" style={{ borderColor: "rgba(0,0,0,0.08)", boxShadow: "0 8px 28px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-[12px] font-bold text-[#aeaeb2] uppercase tracking-widest">
          {groupLabel} · {dateStr}
        </span>
        <div className="flex items-center gap-2">
          {hasScore ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: isSaved ? "#e8f5e9" : "#e8f0fd", color: isSaved ? "#2e7d32" : "#0071e3" }}>
              {isSaved ? "Guardado" : "Cargado"}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f5f5f7] text-[#6e6e73]">
              Pendiente
            </span>
          )}
        </div>
      </div>

      {/* Match Row */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-12 h-12 shrink-0 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            {homeFlag ? (
              <span className="text-2xl">{homeFlag}</span>
            ) : (
              <span className="font-bold text-[#1d1d1f] text-sm text-center px-1" style={{ fontSize: homeCode.length > 3 ? '10px' : '14px' }}>
                {homeCode}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] text-[#1d1d1f] font-bold hidden sm:block">{homeName}</span>
            <span className="text-[14px] text-[#1d1d1f] font-bold block sm:hidden">{homeCode}</span>
            <span className="text-[12px] text-[#6e6e73] font-medium hidden sm:block">{homeCode}</span>
          </div>
        </div>

        {/* Score Inputs */}
        <div className="flex items-center gap-3 shrink-0">
          <input
            type="number"
            min="0"
            placeholder="-"
            value={homeScore ?? ""}
            onChange={(e) => onScoreChange('home', e.target.value)}
            className="w-14 h-14 sm:w-16 sm:h-[58px] bg-[#f5f5f7] rounded-[18px] text-center text-[24px] sm:text-[28px] font-extrabold text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 transition-shadow"
            style={{ 
              border: "1px solid rgba(0,0,0,0.10)",
              appearance: "textfield",
              MozAppearance: "textfield", 
            }}
          />
          <span className="text-[#d1d1d6] font-bold text-2xl">–</span>
          <input
            type="number"
            min="0"
            placeholder="-"
            value={awayScore ?? ""}
            onChange={(e) => onScoreChange('away', e.target.value)}
            className="w-14 h-14 sm:w-16 sm:h-[58px] bg-[#f5f5f7] rounded-[18px] text-center text-[24px] sm:text-[28px] font-extrabold text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 transition-shadow"
            style={{ 
              border: "1px solid rgba(0,0,0,0.10)",
              appearance: "textfield",
              MozAppearance: "textfield",
            }}
          />
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[16px] text-[#1d1d1f] font-bold hidden sm:block text-right">{awayName}</span>
            <span className="text-[14px] text-[#1d1d1f] font-bold block sm:hidden text-right">{awayCode}</span>
            <span className="text-[12px] text-[#6e6e73] font-medium hidden sm:block text-right">{awayCode}</span>
          </div>
          <div className="w-12 h-12 shrink-0 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            {awayFlag ? (
              <span className="text-2xl">{awayFlag}</span>
            ) : (
              <span className="font-bold text-[#1d1d1f] text-sm text-center px-1" style={{ fontSize: awayCode.length > 3 ? '10px' : '14px' }}>
                {awayCode}
              </span>
            )}
          </div>
        </div>

      </div>

      <style jsx>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>
    </div>
  );
}
