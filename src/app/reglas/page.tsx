import { AppShell } from "@/components/layout/AppShell";
import { RulesAccordion } from "@/components/rules/RulesAccordion";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function ReglasPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Reglamento Oficial"
        title="Todo claro. Todo justo."
        description="Conocé cómo se suman los puntos, cómo se definen los empates y cómo se otorgan los premios."
      />
      <PageSection>
        <div className="max-w-[720px] mx-auto">
          <PremiumCard noPadding>
            <RulesAccordion />
          </PremiumCard>
          <div className="pt-12 pb-6">
            <p className="text-[#aeaeb2] text-[10px] text-center uppercase tracking-[0.2em] font-bold">
              Última actualización: Mayo 2026
            </p>
          </div>
        </div>
      </PageSection>
    </AppShell>
  );
}
