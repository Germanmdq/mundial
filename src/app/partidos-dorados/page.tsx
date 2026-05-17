import { AppShell } from "@/components/layout/AppShell";
import { GoldenMatchesPreview } from "@/components/home/GoldenMatchesPreview";

export default function PartidosDoradosPage() {
  return (
    <AppShell>
      <div className="px-margin-mobile pt-12 space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-white">Partidos Dorados</h1>
          <p className="text-muted-text">Los encuentros que valen el doble.</p>
        </div>
        
        <GoldenMatchesPreview />

        <div className="bg-surface-container-low border border-glass-border rounded-xl p-6">
          <h3 className="text-primary font-bold mb-4">¿Qué son los Golden Matches?</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
            En cada fecha de la competencia, seleccionamos un partido clave como &quot;Golden Match&quot;. 
            Cualquier punto que obtengas en este partido se multiplicará por 2 automáticamente.
          </p>
          <ul className="space-y-3">
            <li className="flex gap-2 items-start text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-lg">check</span>
              Se anuncian 48hs antes de cada fecha.
            </li>
            <li className="flex gap-2 items-start text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-lg">check</span>
              Valido para todos los tipos de aciertos.
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
