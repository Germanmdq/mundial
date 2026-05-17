import { AppShell } from "@/components/layout/AppShell";
import { PredictionScreen } from "@/components/prediction/PredictionScreen";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";

export default function PrediccionPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Mi predicción"
        title="Armá tu Mundial."
        description="Cargá tus resultados, seguí cada grupo y guardá tu camino al campeón."
      />
      <PageSection>
        <PredictionScreen />
      </PageSection>
    </AppShell>
  );
}
