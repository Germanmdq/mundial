"use client";

import React, { useState, useMemo } from "react";
import type { Team } from "@/lib/worldcup/teams";
import type { Player } from "@/lib/worldcup/players";
import { TeamSelectCard } from "./TeamSelectCard";
import { PlayerCard } from "./PlayerCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTeamDisplayName, getTeamCode } from "@/lib/worldcup/team-display-names";

interface JugadoresClientProps {
  teams: Team[];
  players: Player[];
  initialTeamId?: string;
}

type FilterMode = "all" | "with_players" | "without_players";

export function JugadoresClient({ teams, players, initialTeamId }: JugadoresClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  
  // Initialize with initialTeamId or the first team if none provided
  const [activeTeamId, setActiveTeamId] = useState<string | null>(
    initialTeamId || (teams.length > 0 ? String(teams[0].id) : null)
  );

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

  // Filter teams based on search and chip filters
  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return teams.filter(team => {
      const teamPlayers = playersByTeam.get(String(team.id)) || [];
      const hasPlayers = teamPlayers.length > 0;
      
      // Chip filter
      if (filterMode === "with_players" && !hasPlayers) return false;
      if (filterMode === "without_players" && hasPlayers) return false;

      // Search filter
      if (query) {
        const teamNameEs = getTeamDisplayName(team.name).toLowerCase();
        const teamCode = getTeamCode(team.name).toLowerCase();
        const matchesTeam = teamNameEs.includes(query) || teamCode.includes(query);
        
        // Also check if any player in this team matches the query
        const matchesPlayer = teamPlayers.some(p => 
          p.name.toLowerCase().includes(query) || 
          (p.display_name && p.display_name.toLowerCase().includes(query))
        );

        if (!matchesTeam && !matchesPlayer) return false;
      }

      return true;
    });
  }, [teams, playersByTeam, searchQuery, filterMode]);

  const activeTeam = useMemo(() => {
    return teams.find(t => String(t.id) === activeTeamId) || null;
  }, [teams, activeTeamId]);

  // Filter the active team's players by search query
  const visiblePlayers = useMemo(() => {
    if (!activeTeam) return [];
    let list = playersByTeam.get(String(activeTeam.id)) || [];
    
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.display_name && p.display_name.toLowerCase().includes(query)) ||
        (p.club && p.club.toLowerCase().includes(query)) ||
        (p.position && p.position.toLowerCase().includes(query))
      );
    }
    return list;
  }, [activeTeam, playersByTeam, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-10">
      
      {/* SECTION: ELEGÍ UNA SELECCIÓN */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[20px] font-black tracking-tight text-[#1d1d1f]">
            Elegí una selección
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar selección o jugador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[260px] h-[40px] pl-10 pr-4 rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-[14px] font-medium text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#aeaeb2] material-symbols-rounded">
                search
              </span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
              <FilterChip label="Todos" active={filterMode === "all"} onClick={() => setFilterMode("all")} />
              <FilterChip label="Con jugadores" active={filterMode === "with_players"} onClick={() => setFilterMode("with_players")} />
              <FilterChip label="Sin jugadores" active={filterMode === "without_players"} onClick={() => setFilterMode("without_players")} />
            </div>
          </div>
        </div>

        <div className="teamGrid">
          {filteredTeams.length > 0 ? (
            filteredTeams.map(team => (
              <TeamSelectCard
                key={team.id}
                team={team}
                playerCount={playersByTeam.get(String(team.id))?.length || 0}
                isActive={String(team.id) === activeTeamId}
                onClick={() => {
                  setActiveTeamId(String(team.id));
                  // Smooth scroll to players section
                  setTimeout(() => {
                    document.getElementById('players-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-[#6e6e73] font-medium bg-white rounded-[24px] border border-[rgba(0,0,0,0.06)]">
              No se encontraron selecciones.
            </div>
          )}
        </div>
      </section>

      {/* SECTION: PANEL DE JUGADORES */}
      {activeTeam && (
        <section id="players-panel" className="scroll-mt-24">
          <PremiumCard className="overflow-hidden">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.06)] pb-6">
              <div>
                <h2 className="text-[28px] font-black tracking-tight text-[#1d1d1f]">
                  {getTeamDisplayName(activeTeam.name)}
                </h2>
                <p className="mt-1 text-[13px] font-bold uppercase tracking-wider text-[#6e6e73]">
                  {getTeamCode(activeTeam.name)} · Grupo {activeTeam.group_letter || "-"}
                </p>
              </div>
              <StatusBadge variant="gold" className="self-start sm:self-center">
                Jugadores en revisión
              </StatusBadge>
            </div>

            {visiblePlayers.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon="person_search"
                  title={searchQuery ? "Sin resultados" : "Plantel en actualización"}
                  description={
                    searchQuery 
                      ? "No hay jugadores que coincidan con tu búsqueda."
                      : `Todavía no hay jugadores cargados para ${getTeamDisplayName(activeTeam.name)}.`
                  }
                />
              </div>
            ) : (
              <div className="playersGrid">
                {visiblePlayers.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    teamSlug={activeTeam.slug} 
                    teamName={activeTeam.name} 
                  />
                ))}
              </div>
            )}
          </PremiumCard>
        </section>
      )}

      <style jsx>{`
        .teamGrid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .playersGrid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-width: 1024px) {
          .teamGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .playersGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 734px) {
          .teamGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .playersGrid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
        active 
          ? "bg-[#1d1d1f] text-white" 
          : "bg-white text-[#6e6e73] border border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)] hover:text-[#1d1d1f]"
      }`}
    >
      {label}
    </button>
  );
}
