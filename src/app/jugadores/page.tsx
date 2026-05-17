import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { getPlayersByTeam } from "@/lib/worldcup/players";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ team?: string }>;
}

export default async function JugadoresPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const teams = await getTeams();
  
  // Default to the first team if none is selected
  const activeTeamId = resolvedSearchParams.team || (teams.length > 0 ? teams[0].id : "");
  
  const activeTeam = teams.find(t => String(t.id) === String(activeTeamId)) || null;
  const players = activeTeam ? await getPlayersByTeam(activeTeam.id) : [];

  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen py-24">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block">
              Planteles en Revisión
            </span>
            <h1 className="font-display font-extrabold text-[#1d1d1f] text-4xl tracking-tight">
              Jugadores y Selecciones
            </h1>
            <p className="text-[#6e6e73] text-[16px] max-w-lg mx-auto">
              Explorá los planteles de cada selección clasificada al Mundial 2026.
            </p>
          </div>

          {teams.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon="groups"
                title="Sin selecciones cargadas"
                description="Las selecciones y planteles oficiales estarán disponibles muy pronto."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Teams Selector Sidebar */}
              <div className="md:col-span-1 bg-white rounded-3xl border border-[#e5e5e7] p-5 shadow-sm space-y-3 h-fit max-h-[70vh] overflow-y-auto">
                <h3 className="font-display font-bold text-[#1d1d1f] text-[15px] px-2 pb-2 border-b border-[#f0f0f2]">
                  Selecciones
                </h3>
                <div className="space-y-1">
                  {teams.map((t) => {
                    const isActive = String(t.id) === String(activeTeamId);
                    return (
                      <Link
                        key={t.id}
                        href={`/jugadores?team=${t.id}`}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                          isActive
                            ? "bg-[#e8f0fd] text-[#0071e3]"
                            : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                        }`}
                      >
                        {t.flag_url ? (
                          <img
                            src={t.flag_url}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-[#e5e5e7] shrink-0"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-[#aeaeb2]">flag</span>
                        )}
                        <span className="truncate">{t.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Players Grid / Status */}
              <div className="md:col-span-3 space-y-6">
                {activeTeam && (
                  <div className="bg-white rounded-3xl border border-[#e5e5e7] p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#f0f0f2] mb-6">
                      <div className="flex items-center gap-4">
                        {activeTeam.flag_url ? (
                          <img
                            src={activeTeam.flag_url}
                            alt={`Bandera de ${activeTeam.name}`}
                            className="w-12 h-12 rounded-full object-cover border border-[#e5e5e7] shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] border border-[#e5e5e7] flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-[#86868b]">flag</span>
                          </div>
                        )}
                        <div>
                          <h2 className="font-display font-bold text-2xl text-[#1d1d1f] leading-tight">
                            {activeTeam.name}
                          </h2>
                          <p className="text-[12px] text-[#aeaeb2] uppercase tracking-wider font-semibold mt-0.5">
                            FIFA Code: {activeTeam.fifa_code || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="self-start sm:self-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fef3c7] text-[#d97706] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                          Plantel en revisión
                        </span>
                      </div>
                    </div>

                    {players.length === 0 ? (
                      <div className="py-8">
                        <EmptyState
                          icon="person_search"
                          title="Plantel en actualización"
                          description={`Estamos recopilando y revisando los jugadores oficiales convocados por ${activeTeam.name}.`}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {players.map((player) => (
                          <div
                            key={player.id}
                            className="bg-[#f5f5f7] border border-[#e5e5e7] rounded-2xl p-4 flex items-center gap-3 hover:border-[#aeaeb2] transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#e5e5e7] text-[#0071e3] font-bold text-[14px]">
                              {player.shirt_number || "#"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[#1d1d1f] font-bold text-[14px] truncate">
                                {player.name}
                              </h4>
                              <p className="text-[12px] text-[#86868b] capitalize truncate">
                                {player.position || "Por confirmar"}
                              </p>
                              {player.club && (
                                <p className="text-[10px] text-[#aeaeb2] truncate mt-0.5">
                                  Club: {player.club}
                                </p>
                              )}
                            </div>
                            {player.status === "pending_review" && (
                              <span className="w-2.5 h-2.5 bg-[#d97706] rounded-full shrink-0 shadow-sm" title="En revisión" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
