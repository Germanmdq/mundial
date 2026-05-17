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

  const handleDecrement = (side: 'home' | 'away', val: number | "") => {
    if (val === "" || val <= 0) {
      onScoreChange(side, "0");
    } else {
      onScoreChange(side, String(val - 1));
    }
  };

  const handleIncrement = (side: 'home' | 'away', val: number | "") => {
    if (val === "") {
      onScoreChange(side, "1");
    } else {
      onScoreChange(side, String(val + 1));
    }
  };

  return (
    <div className="matchCard">
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

      <div className="matchCardInner">
        
        {/* Desktop Layout Wrapper */}
        <div className="desktopLayout flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-3 teamBlock">
            <div className="w-12 h-12 shrink-0 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              {homeFlag ? (
                <span className="text-2xl">{homeFlag}</span>
              ) : (
                <span className="font-bold text-[#1d1d1f] text-sm text-center px-1" style={{ fontSize: homeCode.length > 3 ? '10px' : '14px' }}>
                  {homeCode}
                </span>
              )}
            </div>
            <div className="flex flex-col text-left teamInfo">
              <span className="text-[16px] text-[#1d1d1f] font-bold teamName hidden sm:block">{homeName}</span>
              <span className="text-[12px] text-[#6e6e73] font-medium teamCode hidden sm:block">{homeCode}</span>
            </div>
          </div>

          {/* Home Stepper */}
          <div className="scoreStepper">
            <button
              type="button"
              className="scoreButton"
              onClick={() => handleDecrement('home', homeScore)}
              disabled={(homeScore === "" ? 0 : homeScore) <= 0}
              aria-label="Restar gol"
            >
              −
            </button>
            <div className="scoreValue">{homeScore === "" ? "-" : homeScore}</div>
            <button
              type="button"
              className="scoreButton"
              onClick={() => handleIncrement('home', homeScore)}
              aria-label="Sumar gol"
            >
              +
            </button>
          </div>

          <span className="versus">VS</span>

          {/* Away Stepper */}
          <div className="scoreStepper">
            <button
              type="button"
              className="scoreButton"
              onClick={() => handleDecrement('away', awayScore)}
              disabled={(awayScore === "" ? 0 : awayScore) <= 0}
              aria-label="Restar gol"
            >
              −
            </button>
            <div className="scoreValue">{awayScore === "" ? "-" : awayScore}</div>
            <button
              type="button"
              className="scoreButton"
              onClick={() => handleIncrement('away', awayScore)}
              aria-label="Sumar gol"
            >
              +
            </button>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center justify-end gap-3 teamBlock">
            <div className="flex flex-col items-end text-right teamInfo">
              <span className="text-[16px] text-[#1d1d1f] font-bold teamName hidden sm:block">{awayName}</span>
              <span className="text-[12px] text-[#6e6e73] font-medium teamCode hidden sm:block">{awayCode}</span>
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

        {/* Mobile Layout Wrapper */}
        <div className="mobileLayout">
          <div className="matchTeams">
            {/* Home Row */}
            <div className="teamScoreRow">
              <div className="flex items-center gap-3 teamBlock">
                <div className="w-12 h-12 shrink-0 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  {homeFlag ? <span className="text-2xl">{homeFlag}</span> : <span className="font-bold text-[#1d1d1f] text-sm">{homeCode}</span>}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[15px] text-[#1d1d1f] font-bold teamName">{homeName}</span>
                  <span className="text-[12px] text-[#6e6e73] font-medium teamCode">{homeCode}</span>
                </div>
              </div>
              <div className="scoreStepper ml-auto">
                <button
                  type="button"
                  className="scoreButton"
                  onClick={() => handleDecrement('home', homeScore)}
                  disabled={(homeScore === "" ? 0 : homeScore) <= 0}
                  aria-label="Restar gol"
                >
                  −
                </button>
                <div className="scoreValue">{homeScore === "" ? "-" : homeScore}</div>
                <button
                  type="button"
                  className="scoreButton"
                  onClick={() => handleIncrement('home', homeScore)}
                  aria-label="Sumar gol"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Away Row */}
            <div className="teamScoreRow">
              <div className="flex items-center gap-3 teamBlock">
                <div className="w-12 h-12 shrink-0 bg-[#f5f5f7] rounded-full flex items-center justify-center border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  {awayFlag ? <span className="text-2xl">{awayFlag}</span> : <span className="font-bold text-[#1d1d1f] text-sm">{awayCode}</span>}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[15px] text-[#1d1d1f] font-bold teamName">{awayName}</span>
                  <span className="text-[12px] text-[#6e6e73] font-medium teamCode">{awayCode}</span>
                </div>
              </div>
              <div className="scoreStepper ml-auto">
                <button
                  type="button"
                  className="scoreButton"
                  onClick={() => handleDecrement('away', awayScore)}
                  disabled={(awayScore === "" ? 0 : awayScore) <= 0}
                  aria-label="Restar gol"
                >
                  −
                </button>
                <div className="scoreValue">{awayScore === "" ? "-" : awayScore}</div>
                <button
                  type="button"
                  className="scoreButton"
                  onClick={() => handleIncrement('away', awayScore)}
                  aria-label="Sumar gol"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .matchCard {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 28px;
          padding: 24px 28px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 28px rgba(0,0,0,0.05);
        }

        .scoreStepper {
          display: grid;
          grid-template-columns: 38px 48px 38px;
          align-items: center;
          justify-content: center;
          gap: 6px;
          max-width: 100%;
        }

        .scoreButton {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.10);
          background: #ffffff;
          color: #1d1d1f;
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .scoreButton:active {
          transform: scale(0.96);
        }

        .scoreButton:disabled {
          opacity: 0.35;
          pointer-events: none;
        }

        .scoreValue {
          width: 48px;
          height: 44px;
          border-radius: 15px;
          background: #f5f5f7;
          border: 1px solid rgba(0, 0, 0, 0.10);
          color: #1d1d1f;
          font-size: 24px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .versus {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #6e6e73;
          text-align: center;
          padding: 0 8px;
        }

        .mobileLayout {
          display: none;
        }

        @media (min-width: 735px) {
          .scoreStepper {
            grid-template-columns: 42px 62px 42px;
            gap: 8px;
          }

          .scoreButton {
            width: 42px;
            height: 42px;
          }

          .scoreValue {
            width: 62px;
            height: 56px;
            font-size: 30px;
          }
        }

        @media (max-width: 734px) {
          .desktopLayout {
            display: none !important;
          }

          .mobileLayout {
            display: block;
          }

          .matchCard {
            padding: 18px 14px;
            border-radius: 24px;
          }

          .matchCardInner {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .matchTeams {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
            width: 100%;
            max-width: 100%;
          }

          .teamScoreRow {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
            align-items: center;
            width: 100%;
            max-width: 100%;
          }

          .teamBlock {
            min-width: 0;
            max-width: 100%;
          }

          .teamName {
            max-width: 100%;
            overflow-wrap: anywhere;
            font-size: 15px;
            line-height: 1.15;
          }

          .teamCode {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
