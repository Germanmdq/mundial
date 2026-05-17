import { AppShell } from "@/components/layout/AppShell";
import { RulesAccordion } from "@/components/rules/RulesAccordion";

export default function ReglasPage() {
  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen pt-24 pb-16">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="mb-8 space-y-2 text-center sm:text-left">
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block">
              Reglamento Oficial
            </span>
            <h1 className="font-display font-bold text-[#1d1d1f] text-3xl tracking-tight">
              Reglas y Condiciones
            </h1>
            <p className="text-[#6e6e73] text-[15px]">
              Todo lo que necesitás saber sobre la competencia deportiva Mundial 2026.
            </p>
          </div>
          
          <RulesAccordion />

          <div className="pt-12 pb-6">
            <p className="text-[#aeaeb2] text-[10px] text-center uppercase tracking-widest font-semibold">
              Última actualización: Mayo 2026
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
