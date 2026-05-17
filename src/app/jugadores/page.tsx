import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { getPlayers } from "@/lib/worldcup/players";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { JugadoresClient } from "@/components/worldcup/JugadoresClient";

interface PageProps {
  searchParams: Promise<{ team?: string }>;
}

export default async function JugadoresPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialTeamId = resolvedSearchParams.team;
  
  // Fetch all teams and all players directly
  const [teams, players] = await Promise.all([
    getTeams(),
    getPlayers()
  ]);

  return (
    <AppShell>
      <PageHero 
        eyebrow="Jugadores"
        title="Planteles en revisión."
        description="Consultá jugadores cargados, estados de revisión y perfiles disponibles para cada selección."
      />

      <PageSection>
        <JugadoresClient 
          teams={teams} 
          players={players} 
          queryTeamId={initialTeamId} 
        />
      </PageSection>
    </AppShell>
  );
}
