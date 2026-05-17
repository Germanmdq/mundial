import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTeams } from "@/lib/worldcup/teams";
import { getPlayers } from "@/lib/worldcup/players";
import { EquiposClient } from "@/components/worldcup/EquiposClient";
import { PageHero } from "@/components/layout/PageHero";

export default async function EquiposPage() {
  const [teams, players] = await Promise.all([
    getTeams(),
    getPlayers()
  ]);

  return (
    <AppShell>
      <PageHero 
        eyebrow="Equipos"
        title="Los equipos del Mundial."
        description="Explorá las selecciones, sus grupos y el camino que pueden recorrer durante la competencia."
      />
      
      <EquiposClient teams={teams} players={players} />
    </AppShell>
  );
}
