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
        <div className="max-w-[760px] mx-auto">
          <PremiumCard className="mb-6">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0071e3]">
                Naturaleza del juego
              </p>
              <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-[#1d1d1f]">
                Una competencia recreativa de predicciones deportivas.
              </h2>
              <p className="text-[15px] font-semibold leading-7 text-[#5f6065]">
                Mundial entre Amigos es una competencia recreativa de predicciones deportivas entre participantes. El resultado depende de los pronósticos cargados por cada usuario y del sistema de puntuación publicado.
              </p>
              <p className="text-[15px] font-semibold leading-7 text-[#5f6065]">
                No se trata de una apuesta contra la plataforma. La plataforma organiza el juego, registra las predicciones, calcula el ranking y administra el pozo acumulado según las reglas informadas.
              </p>
              <p className="text-[14px] font-bold leading-6 text-[#1d1d1f]">
                Participá con responsabilidad y solo si entendés las reglas del juego.
              </p>
            </div>
          </PremiumCard>
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
