import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export default async function EquiposPage() {
  const teams = await getTeams();

  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen py-24">
        <div className="max-w-[1040px] mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block">
              Selecciones Oficiales
            </span>
            <h1 className="font-display font-extrabold text-[#1d1d1f] text-4xl tracking-tight">
              Equipos de la Copa Mundial 2026
            </h1>
            <p className="text-[#6e6e73] text-[16px] max-w-lg mx-auto">
              Conocé las selecciones clasificadas y sus planteles oficiales para la competencia.
            </p>
          </div>

          {!teams || teams.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon="flag"
                title="Equipos en actualización"
                description="Estamos cargando el listado oficial de las selecciones. Vuelve muy pronto."
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl border border-[#e5e5e7] p-5 flex flex-col items-center justify-between text-center hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#f5f5f7] border border-[#e5e5e7] flex items-center justify-center overflow-hidden mb-4 shrink-0 shadow-sm relative">
                    {team.flag_url ? (
                      <img
                        src={team.flag_url}
                        alt={`Bandera de ${team.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#86868b]">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>flag</span>
                        <span className="text-[9px] font-bold tracking-wider uppercase opacity-80 mt-0.5">{team.fifa_code || "FIFA"}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center mb-4">
                    <h3 className="text-[#1d1d1f] font-bold text-[16px] leading-tight mb-1 group-hover:text-[#0071e3] transition-colors">
                      {team.name}
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full inline-block self-center">
                      Grupo {team.group_letter || team.group_name || "-"}
                    </span>
                  </div>

                  <Link
                    href={`/jugadores?team=${team.id}`}
                    className="text-[#0071e3] text-[13px] font-semibold inline-flex items-center gap-1 hover:underline active:scale-95 transition-all"
                  >
                    Ver Plantel
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
