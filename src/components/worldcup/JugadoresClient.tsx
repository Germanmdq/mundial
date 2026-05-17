"use client";

import React, { useState, useMemo } from "react";
import type { Team } from "@/lib/worldcup/teams";
import type { Player } from "@/lib/worldcup/players";
import { TeamSelectCard } from "./TeamSelectCard";
import { PlayerCard } from "./PlayerCard";
import Link from "next/link";
import { getTeamDisplayName, getTeamCode } from "@/lib/worldcup/team-display-names";
import { getFifaTeamProfile } from "@/lib/worldcup/team-history";
import { SafeAssetImage } from "@/components/worldcup/SafeAssetImage";
import { getTeamAssetSources } from "@/lib/worldcup/assets";

interface JugadoresClientProps {
  teams: Team[];
  players: Player[];
  queryTeamId?: string;
}

type FilterMode = "all" | "with_players" | "without_players";

function FlagFallback({ code }: { code: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f5f5f7] text-[12px] font-black tracking-widest text-[#1d1d1f]">
      {code ?? 'FIFA'}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  const isPending = value === "En revisión";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold text-[#8e8e93] leading-none uppercase tracking-wider">{label}</span>
      <span className={`text-[14px] font-black mt-1 leading-snug ${isPending ? "text-[#8e8e93] italic font-medium" : "text-[#1d1d1f]"}`}>
        {value}
      </span>
    </div>
  );
}

export function JugadoresClient({ teams, players, queryTeamId }: JugadoresClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  
  // Find the team by slug or ID
  const queryTeam = queryTeamId ? teams.find(t => String(t.id) === queryTeamId || t.slug === queryTeamId) : null;
  const isPreselected = !!queryTeam;
  
  const [activeTeamId, setActiveTeamId] = useState<string | null>(
    queryTeam ? String(queryTeam.id) : null
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

  // FIFA History Profile calculations
  const profile = activeTeam ? getFifaTeamProfile(activeTeam.slug) : null;
  const isImported = profile?.status === 'imported';

  const confederation = isImported && profile?.confederation ? profile.confederation : "En revisión";
  const appearances = isImported && profile?.appearancesCount ? `${profile.appearancesCount}` : "En revisión";
  const bestResult = isImported && profile?.bestResult ? (profile.bestResult === 'Campeon' ? 'Campeón' : profile.bestResult) : "En revisión";
  const lastParticipation = isImported && profile?.lastWorldCup ? profile.lastWorldCup : "En revisión";
  const firstParticipation = isImported && profile?.firstWorldCup ? profile.firstWorldCup : "En revisión";

  const titlesCount = isImported && profile?.bestResult === 'Campeon' ? (profile?.bestResultYears?.length || 0) : 0;
  const titles = isImported ? `${titlesCount}` : "En revisión";

  // Group players by position
  const groupedPlayers = useMemo(() => {
    const groups: { title: string; list: Player[] }[] = [
      { title: "Arqueros", list: [] },
      { title: "Defensores", list: [] },
      { title: "Mediocampistas", list: [] },
      { title: "Delanteros", list: [] },
      { title: "Sin posición confirmada", list: [] },
    ];

    visiblePlayers.forEach((p) => {
      const pos = (p.position || "").trim().toUpperCase();
      if (pos === "GK") {
        groups[0].list.push(p);
      } else if (pos === "DF") {
        groups[1].list.push(p);
      } else if (pos === "MF") {
        groups[2].list.push(p);
      } else if (pos === "FW") {
        groups[3].list.push(p);
      } else {
        groups[4].list.push(p);
      }
    });

    return groups.filter((g) => g.list.length > 0);
  }, [visiblePlayers]);

  const flagSources = activeTeam 
    ? [...getTeamAssetSources(activeTeam.team_assets, 'flag', activeTeam.slug), activeTeam.flag_url].filter((source): source is string => Boolean(source))
    : [];

  const teamVisualSources = activeTeam 
    ? [
        `/worldcup-assets/teams/${activeTeam.slug}/hero.webp`,
        `/worldcup-assets/teams/${activeTeam.slug}/hero.svg`,
        `/worldcup-assets/teams/${activeTeam.slug}/background.webp`,
        `/worldcup-assets/teams/${activeTeam.slug}/background.svg`,
        `/worldcup-assets/teams/${activeTeam.slug}/flag.svg`
      ].filter(Boolean)
    : [];

  // Roster status information
  const totalCargados = playersByTeam.get(String(activeTeam?.id || ""))?.length || 0;
  const isRosterConfirmed = totalCargados > 0;
  const statusLabel = isRosterConfirmed ? "Plantel en revisión" : "Plantel por confirmar";
  const statusDetail = isRosterConfirmed ? `${totalCargados} jugadores cargados` : "Todavía no hay jugadores cargados para esta selección.";

  return (
    <div className="w-full flex flex-col gap-10">
      
      {/* SECTION: ELEGÍ UNA SELECCIÓN (Only if no query param) */}
      {!isPreselected && (
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
      )}

      {/* SECTION: PANEL DE JUGADORES */}
      {activeTeam && (
        <section id="players-panel" className="scroll-mt-24 space-y-6">
          {isPreselected && (
            <Link 
              href="/jugadores" 
              className="inline-flex items-center text-[14px] font-bold text-[#0071e3] hover:underline animate-fade-in"
            >
              ← Volver a selecciones
            </Link>
          )}

          {/* TEAM HEADER CARD */}
          <div className="teamHeaderCard bg-white border border-[rgba(0,0,0,0.08)] rounded-[34px] p-6 md:p-8 shadow-sm relative overflow-hidden">
            {/* Glassmorphic background blur */}
            <div className="teamHeroBackground">
              <SafeAssetImage
                src={teamVisualSources}
                alt=""
                className="w-full h-full object-cover"
                fallback={<div />}
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white shadow-md shrink-0">
                  <SafeAssetImage
                    src={flagSources}
                    alt={`Bandera de ${getTeamDisplayName(activeTeam.name)}`}
                    className="h-full w-full object-cover"
                    fallback={<FlagFallback code={getTeamCode(activeTeam.name)} />}
                  />
                </div>
                <div>
                  <h2 className="text-[28px] md:text-[34px] font-black tracking-tight text-[#1d1d1f] leading-none">
                    {getTeamDisplayName(activeTeam.name)}
                  </h2>
                  <p className="mt-2 text-[14px] font-bold text-[#6e6e73]">
                    {getTeamCode(activeTeam.name)} · Grupo {activeTeam.group_letter || "-"}
                  </p>
                  <p className="mt-1.5 text-[13px] font-extrabold text-[#0071e3]">
                    {statusLabel} · {statusDetail}
                  </p>
                </div>
              </div>

              {profile?.fifaProfileUrl && (
                <a 
                  href={profile.fifaProfileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[13px] font-bold text-[#0071e3] transition-all self-start md:self-center shrink-0"
                >
                  <span>Ver fuente FIFA</span>
                  <span className="text-[16px] material-symbols-rounded">open_in_new</span>
                </a>
              )}
            </div>

            {/* MINI DATOS HISTÓRICOS COMPACTOS */}
            <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.06)] relative z-10">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-[#6e6e73] mb-3">
                Historia FIFA
              </h4>
              {isImported ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <MiniStat label="Confederación" value={confederation} />
                  <MiniStat label="Participaciones" value={appearances} />
                  <MiniStat label="Títulos" value={titles} />
                  <MiniStat label="Mejor resultado" value={bestResult} />
                  <MiniStat label="Última participación" value={lastParticipation} />
                  <MiniStat label="Primer Mundial" value={firstParticipation} />
                </div>
              ) : (
                <div className="text-[13px] font-bold text-[#8e8e93] italic">
                  Historia en revisión
                </div>
              )}
            </div>
          </div>

          {/* PLAYERS LIST CONTAINER */}
          {!isRosterConfirmed ? (
            <div className="py-12 px-6 text-center bg-white border border-[rgba(0,0,0,0.08)] rounded-[28px] shadow-sm max-w-[500px] mx-auto mt-6">
              <span className="text-[48px] text-[#aeaeb2] material-symbols-rounded">group_off</span>
              <h3 className="text-[18px] font-black text-[#1d1d1f] mt-4">Plantel por confirmar</h3>
              <p className="text-[14px] text-[#6e6e73] font-medium mt-2 leading-relaxed">
                Todavía no hay jugadores cargados para esta selección. Cuando la lista esté disponible, vas a poder ver el plantel completo acá.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SEARCH BAR (Only if team is selected and has players) */}
              <div className="relative max-w-[360px]">
                <input
                  type="text"
                  placeholder="Buscar jugador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[40px] pl-10 pr-4 rounded-full border border-[rgba(0,0,0,0.1)] bg-white text-[14px] font-medium text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#aeaeb2] material-symbols-rounded">
                  search
                </span>
              </div>

              {groupedPlayers.length === 0 ? (
                <div className="py-8 text-center text-[#6e6e73] font-bold bg-white rounded-[28px] border border-[rgba(0,0,0,0.08)]">
                  No se encontraron jugadores que coincidan con tu búsqueda.
                </div>
              ) : (
                <div className="playersPanel">
                  {groupedPlayers.map((group) => (
                    <div key={group.title} className="positionGroup">
                      <h3 className="positionTitle">{group.title}</h3>
                      <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                        {group.list.map((player) => (
                          <PlayerCard 
                            key={player.id} 
                            player={player} 
                            teamSlug={activeTeam.slug} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        .teamGrid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .teamHeroBackground {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
          transform: scale(1.1);
        }

        .playersPanel {
          width: min(980px, 100%);
          margin: 0 auto;
        }

        .positionGroup {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 28px;
          padding: 22px;
          margin-bottom: 18px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.05);
        }

        .positionTitle {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6e6e73;
          margin-bottom: 16px;
        }

        :global(.playerRow) {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          padding: 12px 0;
          border-top: 1px solid rgba(0,0,0,0.06);
        }

        :global(.playerRow:first-of-type) {
          border-top: 0;
          padding-top: 4px;
        }

        :global(.playerRow:last-of-type) {
          padding-bottom: 4px;
        }

        :global(.playerAvatar) {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          object-fit: cover;
          background: #f5f5f7;
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }

        :global(.playerName) {
          font-size: 16px;
          font-weight: 850;
          color: #1d1d1f;
          line-height: 1.15;
        }

        :global(.playerMeta) {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #6e6e73;
        }

        @media (max-width: 1024px) {
          .teamGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 734px) {
          .teamGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
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
