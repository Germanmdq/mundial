import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamCard } from "@/components/worldcup/TeamCard";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";

export default async function EquiposPage() {
  const teams = await getTeams();

  return (
    <AppShell>
      <PageHero 
        eyebrow="Equipos"
        title="Los equipos del Mundial."
        description="Explorá las selecciones, sus grupos y el camino que pueden recorrer durante la competencia."
      />
      
      <PageSection>
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
      </PageSection>
    </AppShell>
  );
}
