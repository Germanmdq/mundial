import { AppShell } from "@/components/layout/AppShell";
import { PredictionScreen } from "@/components/prediction/PredictionScreen";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";

type PrediccionPageProps = {
  searchParams?: Promise<{
    debugPrediction?: string;
  }>;
};

export default async function PrediccionPage({ searchParams }: PrediccionPageProps) {
  const params = await searchParams;
  const debugPrediction = params?.debugPrediction === "1";

  return (
    <AppShell>
      <PageHero 
        eyebrow="Mi predicción"
        title="Armá tu Mundial."
        description="Cargá tus resultados, seguí cada grupo y guardá tu camino al campeón."
      />
      <PageSection>
        <PredictionScreen debugPrediction={debugPrediction} />
      </PageSection>
    </AppShell>
  );
}
