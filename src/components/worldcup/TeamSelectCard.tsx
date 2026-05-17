import React from "react";
import { SafeAssetImage } from "@/components/worldcup/SafeAssetImage";
import type { Team } from "@/lib/worldcup/teams";
import { getTeamDisplayName, getTeamCode } from "@/lib/worldcup/team-display-names";

interface TeamSelectCardProps {
  team: Team;
  playerCount: number;
  isActive: boolean;
  onClick: () => void;
}

export function TeamSelectCard({ team, playerCount, isActive, onClick }: TeamSelectCardProps) {
  const displayName = getTeamDisplayName(team.name);
  const displayCode = getTeamCode(team.name);
  const flagSources = team.flag_url ? [team.flag_url] : [];
  
  let statusText = "Sin jugadores";
  let statusColor = "text-[#6e6e73]";
  if (playerCount > 0 && playerCount < 26) {
    statusText = `${playerCount} jugadores en revisión`;
    statusColor = "text-[#c9a227]";
  } else if (playerCount >= 26) {
    statusText = "Plantel cargado";
    statusColor = "text-[#0071e3]";
  }

  return (
    <button
      onClick={onClick}
      className={`teamSelectCard text-left transition-all duration-200 ${isActive ? 'active' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-full bg-[#f5f5f7] border border-[rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden">
          <SafeAssetImage
            src={flagSources}
            alt={`Bandera de ${displayName}`}
            className="w-full h-full object-cover"
            fallback={
              <span className="text-[10px] font-black tracking-wider text-[#1d1d1f]">
                {displayCode}
              </span>
            }
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-[#1d1d1f] truncate">{displayName}</h3>
          <p className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider truncate mt-0.5">
            {displayCode} · Grupo {team.group_letter || "-"}
          </p>
          <p className={`text-[12px] font-medium mt-1 truncate ${statusColor}`}>
            {statusText}
          </p>
        </div>
      </div>

      <style jsx>{`
        .teamSelectCard {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 18px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
          width: 100%;
          cursor: pointer;
        }

        .teamSelectCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .teamSelectCard:active {
          transform: scale(0.98);
        }

        .teamSelectCard.active {
          border-color: #0071e3;
          background: #fbfdff;
          box-shadow: 0 8px 24px rgba(0, 113, 227, 0.12);
        }
      `}</style>
    </button>
  );
}
