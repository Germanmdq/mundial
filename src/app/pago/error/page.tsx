import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function PagoErrorPage() {
  return (
    <AppShell>
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-20">
        <PremiumCard className="max-w-xl p-8 text-center">
          <h1 className="font-display text-3xl font-extrabold text-[#1d1d1f]">No pudimos completar el pago</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6e6e73]">
            Podés intentarlo nuevamente desde tu cuenta.
          </p>
          <Link href="/cuenta" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#0071e3] px-6 text-[15px] font-bold text-white">
            Volver a mi cuenta
          </Link>
        </PremiumCard>
      </main>
    </AppShell>
  );
}
