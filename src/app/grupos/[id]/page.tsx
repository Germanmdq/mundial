import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getGroupRanking } from "@/app/actions/groups";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GrupoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getGroupRanking(id);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#f5f5f7] py-24">
        <div className="mx-auto max-w-[920px] px-5 sm:px-6">
          <Link href="/grupos" className="mb-8 inline-flex text-[13px] font-bold text-[#0071e3] hover:underline">
            ← Volver a grupos
          </Link>

          {result.error || !result.group ? (
            <div className="rounded-[28px] border border-[#e5e5e7] bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1d1d1f]">No se pudo abrir el grupo</h1>
              <p className="mt-2 text-[14px] leading-6 text-[#6e6e73]">
                {result.error ?? "Verificá que estés usando una cuenta con acceso a este grupo."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <header className="rounded-[32px] border border-[#e5e5e7] bg-white p-7 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">
                      Ranking privado
                    </span>
                    <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#1d1d1f]">
                      {result.group.name}
                    </h1>
                    <p className="mt-2 text-[14px] font-semibold text-[#6e6e73]">
                      {result.members_count} participantes
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#86868b]">Código</p>
                    <p className="mt-1 font-mono text-xl font-black tracking-[0.14em] text-[#1d1d1f]">
                      {result.group.invite_code}
                    </p>
                  </div>
                </div>
              </header>

              <section className="overflow-hidden rounded-[28px] border border-[#e5e5e7] bg-white shadow-sm">
                {result.ranking.length === 0 ? (
                  <div className="p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#86868b]">leaderboard</span>
                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1d1d1f]">Ranking en actualización</h2>
                    <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#6e6e73]">
                      Cuando los participantes tengan puntos, vas a ver la tabla privada acá.
                    </p>
                  </div>
                ) : (
                  result.ranking.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 px-5 py-4 transition hover:bg-[#f5f5f7] ${
                        index < result.ranking.length - 1 ? "border-b border-[#f0f0f2]" : ""
                      }`}
                    >
                      <span className="w-8 shrink-0 text-center text-[15px] font-black text-[#0071e3]">
                        {entry.rank}
                      </span>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e5e7] bg-[#f0f0f2] text-[13px] font-black uppercase text-[#6e6e73]">
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt={entry.display_name} className="h-full w-full object-cover" />
                        ) : (
                          entry.display_name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-[#1d1d1f]">{entry.display_name}</p>
                        <p className="text-[12px] font-semibold text-[#86868b]">Participante</p>
                      </div>
                      <span className="text-[15px] font-black tabular-nums text-[#1d1d1f]">
                        {entry.total_points.toLocaleString()} pts
                      </span>
                    </div>
                  ))
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
