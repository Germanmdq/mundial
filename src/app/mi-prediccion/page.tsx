import { AppShell } from "@/components/layout/AppShell";
import { PredictionScreen } from "@/components/prediction/PredictionScreen";

export default function PrediccionPage() {
  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen pt-14">
        <PredictionScreen />
      </div>
    </AppShell>
  );
}
