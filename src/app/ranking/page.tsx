import { AppShell } from "@/components/layout/AppShell";
import { Leaderboard } from "@/components/ranking/Leaderboard";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function RankingPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Ranking"
        title="La tabla donde se gana el orgullo."
        description="Seguí los puntos, posiciones y movimientos de cada participante durante el Mundial."
      />
      <PageSection>
        <div className="max-w-[800px] mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {["Global", "Grupo A", "Mis Amigos"].map((t, i) => (
              <button key={t}
                className="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                style={{
                  background: i === 0 ? "#1d1d1f" : "#ffffff",
                  color:      i === 0 ? "#ffffff" : "#6e6e73",
                  border:     i === 0 ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
                  boxShadow:  i === 0 ? "none" : "0 1px 2px rgba(0,0,0,0.04)"
                }}>
                {t}
              </button>
            ))}
          </div>

          <PremiumCard noPadding>
            <Leaderboard />
          </PremiumCard>
        </div>
      </PageSection>
    </AppShell>
  );
}
