import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GroupsPanel } from "@/components/groups/GroupsPanel";
import { getMyGroups } from "@/app/actions/groups";
import { getUser } from "@/lib/auth/getUser";
import type { PrivateGroup } from "@/lib/groups/types";

type PageProps = {
  searchParams: Promise<{ codigo?: string }>;
};

export default async function GruposPage({ searchParams }: PageProps) {
  const user = await getUser();
  const resolvedSearchParams = await searchParams;
  
  let isActive = false;
  let groups: PrivateGroup[] = [];
  
  if (user) {
    const { getParticipationForUser } = await import("@/lib/server/payments");
    const participation = await getParticipationForUser(user.id);
    isActive = !!(participation && participation.status === "active" && participation.paid === true && participation.payment_status === "approved");
    groups = await getMyGroups();
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#f5f5f7] py-24">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">
              Grupos privados
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-5xl">
              Competí con tus amigos
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-[#6e6e73]">
              Creá una tabla privada, compartí el código de invitación y compará posiciones dentro del grupo.
            </p>
          </div>

          {!user ? (
            <div className="rounded-[28px] border border-[#e5e5e7] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1d1d1f]">Iniciá sesión para usar grupos</h2>
              <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#6e6e73]">
                Los grupos privados se guardan en tu cuenta para que puedas volver al ranking cuando quieras.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex rounded-full bg-[#0071e3] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#0066cc]"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <GroupsPanel groups={groups} initialInviteCode={resolvedSearchParams.codigo ?? ""} isActive={isActive} />
          )}
        </div>
      </main>
    </AppShell>
  );
}
