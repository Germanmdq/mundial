import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { getPlayersByTeam } from "@/lib/worldcup/players";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerCard } from "@/components/worldcup/PlayerCard";
import { SafeAssetImage } from "@/components/worldcup/SafeAssetImage";
import { getTeamAssetSources } from "@/lib/worldcup/assets";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface PageProps {
  searchParams: Promise<{ team?: string }>;
}

function FlagFallback({ code }: { code: string | null }) {
  return (
    <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[9px] font-black tracking-[0.12em] text-[#6e6e73]">
      {code ?? "FIFA"}
    </span>
  );
}

export default async function JugadoresPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const teams = await getTeams();
  const activeTeamId = resolvedSearchParams.team || (teams.length > 0 ? String(teams[0].id) : "");
  const activeTeam = teams.find((team) => String(team.id) === String(activeTeamId)) || null;
  const players = activeTeam ? await getPlayersByTeam(activeTeam.id) : [];

  return (
    <AppShell>
      <PageHero 
        eyebrow="Jugadores"
        title="Planteles en revisión."
        description="Consultá jugadores cargados, estados de revisión y perfiles disponibles para cada equipo."
      />

      <PageSection>
        {teams.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon="groups"
              title="Sin selecciones cargadas"
              description="Las selecciones y planteles estarán disponibles muy pronto."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit max-h-[72vh] overflow-y-auto rounded-[24px] border border-[#e5e5e7] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <h2 className="px-2 pb-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#6e6e73]">
                Selecciones
              </h2>
              <div className="space-y-1">
                {teams.map((team) => {
                  const isActive = String(team.id) === String(activeTeamId);
                  const flagSources = [...getTeamAssetSources(team.team_assets, "flag", team.slug), team.flag_url].filter((source): source is string => Boolean(source));
                  const code = team.fifa_code ?? team.name.slice(0, 3).toUpperCase();

                  return (
                    <Link
                      key={team.id}
                      href={`/jugadores?team=${team.id}`}
                      className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-bold transition ${
                        isActive
                          ? "bg-[#e8f0fd] text-[#0071e3] shadow-sm"
                          : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                      }`}
                    >
                      <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[rgba(0,0,0,0.06)] bg-white">
                        <SafeAssetImage
                          src={flagSources}
                          alt={`Bandera de ${team.name}`}
                          className="h-full w-full object-cover"
                          fallback={<FlagFallback code={code} />}
                        />
                      </span>
                      <span className="truncate">{team.name}</span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <section className="space-y-6">
              {activeTeam ? (
                <PremiumCard>
                  <div className="mb-6 flex flex-col gap-4 border-b border-[rgba(0,0,0,0.06)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-full border border-[rgba(0,0,0,0.06)] bg-white shadow-sm">
                        <SafeAssetImage
                          src={[...getTeamAssetSources(activeTeam.team_assets, "flag", activeTeam.slug), activeTeam.flag_url].filter((source): source is string => Boolean(source))}
                          alt={`Bandera de ${activeTeam.name}`}
                          className="h-full w-full object-cover"
                          fallback={<FlagFallback code={activeTeam.fifa_code} />}
                        />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-extrabold leading-tight text-[#1d1d1f]">
                          {activeTeam.name}
                        </h2>
                        <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.14em] text-[#6e6e73]">
                          {activeTeam.fifa_code || "Sin código"} · Grupo {activeTeam.group_letter || "-"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge variant="gold" className="self-start sm:self-center">
                      En revisión
                    </StatusBadge>
                  </div>

                  {players.length === 0 ? (
                    <div className="py-8">
                      <EmptyState
                        icon="person_search"
                        title="Plantel en actualización"
                        description={`Todavía no hay jugadores cargados para ${activeTeam.name}.`}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {players.map((player) => (
                        <PlayerCard key={player.id} player={player} teamSlug={activeTeam.slug} teamName={activeTeam.name} />
                      ))}
                    </div>
                  )}
                </PremiumCard>
              ) : null}
            </section>
          </div>
        )}
      </PageSection>
    </AppShell>
  );
}
