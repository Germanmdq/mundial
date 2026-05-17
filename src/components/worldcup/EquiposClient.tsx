"use client";

import React, { useState, useMemo } from "react";
import type { Team } from "@/lib/worldcup/teams";
import type { Player } from "@/lib/worldcup/players";
import { TeamCard } from "./TeamCard";
import { getTeamDisplayName, getTeamCode } from "@/lib/worldcup/team-display-names";

interface EquiposClientProps {
  teams: Team[];
  players: Player[];
}

export function EquiposClient({ teams, players }: EquiposClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("Todos");

  // Group players by team for quick lookup and counting
  const playersByTeam = useMemo(() => {
    const map = new Map<string, Player[]>();
    teams.forEach(t => map.set(String(t.id), []));
    players.forEach(p => {
      const tid = String(p.team_id);
      if (!map.has(tid)) map.set(tid, []);
      map.get(tid)!.push(p);
    });
    return map;
  }, [teams, players]);

  // Extract unique groups
  const groups = useMemo(() => {
    const groupSet = new Set<string>();
    teams.forEach(t => {
      if (t.group_letter) groupSet.add(`Grupo ${t.group_letter}`);
    });
    const sortedGroups = Array.from(groupSet).sort();
    return ["Todos", ...sortedGroups];
  }, [teams]);

  // Filter teams based on search and group
  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return teams.filter(team => {
      const teamPlayers = playersByTeam.get(String(team.id)) || [];
      const teamNameEs = getTeamDisplayName(team.name).toLowerCase();
      const teamCode = getTeamCode(team.name).toLowerCase();
      const groupLabel = team.group_letter ? `Grupo ${team.group_letter}` : "";
      
      // Group filter
      if (activeGroup !== "Todos" && groupLabel !== activeGroup) {
        return false;
      }

      // Search filter
      if (query) {
        const matchesTeam = 
          teamNameEs.includes(query) || 
          teamCode.includes(query) || 
          groupLabel.toLowerCase().includes(query) ||
          team.name.toLowerCase().includes(query); // Original name as fallback
        
        // Also check if any player in this team matches the query
        const matchesPlayer = teamPlayers.some(p => 
          p.name.toLowerCase().includes(query) || 
          (p.display_name && p.display_name.toLowerCase().includes(query))
        );

        if (!matchesTeam && !matchesPlayer) {
          return false;
        }
      }

      return true;
    });
  }, [teams, playersByTeam, searchQuery, activeGroup]);

  return (
    <div className="w-full">
      {/* SEARCH SECTION */}
      <section className="searchSection">
        <div className="flex flex-col items-center w-full gap-4">
          <input
            type="text"
            placeholder="Buscar equipo o jugador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="searchBox"
          />

          <div className="flex items-center gap-2 max-w-full overflow-x-auto hide-scrollbar pb-2">
            {groups.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                  activeGroup === g 
                    ? "bg-[#1d1d1f] text-white" 
                    : "bg-white text-[#6e6e73] border border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)] hover:text-[#1d1d1f]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TEAMS GRID */}
      {filteredTeams.length === 0 ? (
        <div className="py-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-[28px] p-8 text-center border border-[rgba(0,0,0,0.08)] shadow-sm">
            <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-2">No encontramos resultados</h3>
            <p className="text-[#6e6e73] text-[15px] font-medium">
              Probá buscar por selección, grupo o jugador.
            </p>
          </div>
        </div>
      ) : (
        <div className="teamsGrid pb-12">
          {filteredTeams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              playerCount={playersByTeam.get(String(team.id))?.length || 0}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .searchSection {
          width: min(1180px, 87.5vw);
          margin: 0 auto 32px;
          display: flex;
          justify-content: center;
        }

        .searchBox {
          width: min(680px, 100%);
          height: 54px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.86);
          box-shadow: 0 8px 28px rgba(0,0,0,0.06);
          padding: 0 22px;
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1f;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .searchBox::placeholder {
          color: #9ca3af;
        }

        .searchBox:focus {
          border-color: rgba(0,113,227,0.45);
          box-shadow: 0 0 0 4px rgba(0,113,227,0.10), 0 8px 28px rgba(0,0,0,0.06);
        }

        .teamsGrid {
          width: min(1180px, 87.5vw);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-width: 1100px) {
          .teamsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 734px) {
          .searchSection {
            width: calc(100vw - 28px);
          }
          
          .searchBox {
            height: 50px;
          }

          .teamsGrid {
            width: calc(100vw - 28px);
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
        }

        @media (max-width: 430px) {
          .teamsGrid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
