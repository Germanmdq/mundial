"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { createGroup, joinGroup, type PrivateGroup } from "@/app/actions/groups";

type GroupsPanelProps = {
  groups: PrivateGroup[];
  initialInviteCode?: string;
};

export function GroupsPanel({ groups, initialInviteCode = "" }: GroupsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createName, setCreateName] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode.toUpperCase());
  const [message, setMessage] = useState<string | null>(null);

  const appOrigin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await createGroup(createName);
      if (!result.success) {
        setMessage(result.error ?? "No se pudo crear el grupo.");
        return;
      }

      setCreateName("");
      setMessage("Grupo creado.");
      router.refresh();
    });
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await joinGroup(inviteCode);
      if (!result.success) {
        setMessage(result.error ?? "No se pudo unir al grupo.");
        return;
      }

      setInviteCode("");
      setMessage("Ya estás dentro del grupo.");
      router.refresh();
    });
  }

  async function copyInvite(group: PrivateGroup) {
    const link = `${appOrigin}/grupos?codigo=${encodeURIComponent(group.invite_code)}`;
    await navigator.clipboard.writeText(link);
    setMessage("Link de invitación copiado.");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-4">
        <form onSubmit={handleCreate} className="rounded-[28px] border border-[#e5e5e7] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">Crear grupo</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#6e6e73]">
            Armá una tabla privada para competir con amigos.
          </p>
          <input
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="Nombre del grupo"
            className="mt-5 w-full rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3 text-[14px] font-semibold text-[#1d1d1f] outline-none transition focus:border-[#0071e3]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full rounded-full bg-[#1d1d1f] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Crear grupo
          </button>
        </form>

        <form onSubmit={handleJoin} className="rounded-[28px] border border-[#e5e5e7] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">Unirme con código</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#6e6e73]">
            Pegá el código que te pasó otro participante.
          </p>
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            placeholder="EJ: ABCD2345"
            className="mt-5 w-full rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3 text-[14px] font-black uppercase tracking-[0.14em] text-[#1d1d1f] outline-none transition focus:border-[#0071e3]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full rounded-full bg-[#0071e3] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#0066cc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Unirme
          </button>
        </form>

        {message ? (
          <div className="rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3 text-[13px] font-semibold text-[#1d1d1f] shadow-sm">
            {message}
          </div>
        ) : null}
      </aside>

      <section className="space-y-4">
        {groups.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#c7c7cc] bg-white p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-[#86868b]">groups</span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1d1d1f]">Todavía no tenés grupos</h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#6e6e73]">
              Creá uno nuevo o entrá con un código de invitación para ver el ranking privado.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <article key={group.id} className="rounded-[28px] border border-[#e5e5e7] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#1d1d1f]">{group.name}</h2>
                  <p className="mt-1 text-[13px] font-semibold text-[#6e6e73]">
                    {group.member_count ?? 0} participantes
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyInvite(group)}
                    className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-bold text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
                  >
                    Copiar link
                  </button>
                  <Link
                    href={`/grupos/${group.id}`}
                    className="rounded-full bg-[#1d1d1f] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#0071e3]"
                  >
                    Ver ranking
                  </Link>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-[#f5f5f7] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#86868b]">Código de invitación</p>
                <p className="mt-1 font-mono text-xl font-black tracking-[0.14em] text-[#1d1d1f]">{group.invite_code}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
