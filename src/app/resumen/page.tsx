import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function ResumenPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Resumen"
        title="Un vistazo rápido a tu desempeño."
        description="Mirá tus estadísticas y posición en el ranking de un vistazo."
      />
      
      <PageSection>
        <div className="max-w-[720px] mx-auto space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <PremiumCard className="flex flex-col items-center justify-center gap-2 !p-6">
              <span className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-[0.15em]">Puntos totales</span>
              <span className="text-[#1d1d1f] font-display font-extrabold text-3xl tracking-tight">1,240</span>
            </PremiumCard>
            <PremiumCard className="flex flex-col items-center justify-center gap-2 !p-6">
              <span className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-[0.15em]">Posición global</span>
              <span className="text-[#0071e3] font-display font-extrabold text-3xl tracking-tight">#142</span>
            </PremiumCard>
          </div>

          <div className="pt-4">
            <EmptyState 
              icon="insights" 
              title="Análisis en camino" 
              description="Estamos procesando las estadísticas de la última fecha para darte un resumen detallado."
            />
          </div>
        </div>
      </PageSection>
    </AppShell>
  );
}
