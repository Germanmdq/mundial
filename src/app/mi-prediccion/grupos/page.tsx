import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GruposPage() {
  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen pt-24 pb-16">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-[#1d1d1f] text-3xl mb-2">Tabla de Grupos</h1>
            <p className="text-[#6e6e73] text-[15px]">Seguí el progreso de cada zona oficial.</p>
          </div>

          <div className="py-8">
            <EmptyState 
              icon="table_chart" 
              title="Tablas en actualización" 
              description="Las posiciones oficiales estarán disponibles cuando comience el torneo." 
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
