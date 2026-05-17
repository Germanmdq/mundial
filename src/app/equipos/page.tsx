import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamCard } from "@/components/worldcup/TeamCard";

export default async function EquiposPage() {
  const teams = await getTeams();

  return (
    <AppShell>
      <main className="min-h-screen bg-[#f5f5f7] py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">
              Selecciones
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-5xl">
              Equipos del Mundial 2026
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-[#6e6e73]">
              Explorá los 48 equipos cargados en la base. Cuando falten escudos, banderas o fondos, la app muestra placeholders cuidados sin romper la experiencia.
            </p>
          </div>

          {teams.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon="flag"
                title="Equipos en actualización"
                description="Estamos preparando el listado de selecciones. Vuelve muy pronto."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
