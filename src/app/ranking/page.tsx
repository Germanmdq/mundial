import { AppShell } from "@/components/layout/AppShell";
import { Leaderboard } from "@/components/ranking/Leaderboard";

export default function RankingPage() {
  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen pt-14">
        <div className="max-w-[1040px] mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-[#1d1d1f] text-3xl tracking-tight mb-1">Ranking Global</h1>
            <p className="text-[#6e6e73] text-[15px]">Posiciones actualizadas después de cada fecha.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["Global", "Grupo A", "Mis Amigos"].map((t, i) => (
              <button key={t}
                className="px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
                style={{
                  background: i === 0 ? "#0071e3" : "white",
                  color:      i === 0 ? "white" : "#6e6e73",
                  border:     i === 0 ? "none" : "1px solid #e5e5e7",
                }}>
                {t}
              </button>
            ))}
          </div>

          <Leaderboard />
        </div>
      </div>
    </AppShell>
  );
}
