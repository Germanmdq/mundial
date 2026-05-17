import { AppShell } from "@/components/layout/AppShell";
import { PredictionScreen } from "@/components/prediction/PredictionScreen";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";

export default function PrediccionPage() {
  return (
    <AppShell>
      <PageHero 
        eyebrow="Predicciones"
        title="Armá tu fixture."
        description="Completá los resultados y demostrá cuánto sabés del Mundial."
      />
      <PageSection>
        <PredictionScreen />
      </PageSection>
    </AppShell>
  );
}
