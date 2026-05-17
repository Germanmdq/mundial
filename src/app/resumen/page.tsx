import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ResumenPage() {
  return (
    <AppShell>
      <div className="px-margin-mobile pt-12 space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-white">Resumen</h1>
          <p className="text-muted-text">Un vistazo rápido a tu desempeño.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-titanium-surface/60 border border-glass-border rounded-xl p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-muted-text uppercase tracking-widest">Puntos totales</span>
            <span className="text-white font-bold text-2xl">1,240</span>
          </div>
          <div className="bg-titanium-surface/60 border border-glass-border rounded-xl p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-muted-text uppercase tracking-widest">Posición global</span>
            <span className="text-primary font-bold text-2xl">#142</span>
          </div>
        </div>

        <EmptyState 
          icon="insights" 
          title="Análisis en camino" 
          description="Estamos procesando las estadísticas de la última fecha para darte un resumen detallado."
        />
      </div>
    </AppShell>
  );
}
