import { AppShell } from "@/components/layout/AppShell";
import { GoldenMatchesPreview } from "@/components/home/GoldenMatchesPreview";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function PartidosDoradosPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Partidos Dorados"
        title="Los encuentros que valen el doble."
        description="En cada fecha de la competencia, seleccionamos un partido clave. Cualquier punto que obtengas en este partido se multiplicará por 2."
      />
      
      <PageSection>
        <div className="max-w-[720px] mx-auto space-y-8">
          <GoldenMatchesPreview />

          <PremiumCard>
            <h3 className="font-display font-extrabold text-[#1d1d1f] text-[18px] mb-4">¿Qué son los Golden Matches?</h3>
            <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-6">
              En cada fecha de la competencia, seleccionamos un partido clave como &quot;Golden Match&quot;. 
              Cualquier punto que obtengas en este partido se multiplicará por 2 automáticamente.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-[#0071e3] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-[#1d1d1f] text-[14px] font-medium">Se anuncian 48hs antes de cada fecha.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-[#0071e3] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-[#1d1d1f] text-[14px] font-medium">Valido para todos los tipos de aciertos.</span>
              </li>
            </ul>
          </PremiumCard>
        </div>
      </PageSection>
    </AppShell>
  );
}
