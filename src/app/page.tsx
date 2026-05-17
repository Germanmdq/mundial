import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/home/HomeHero";
import { GoldenMatchesPreview } from "@/components/home/GoldenMatchesPreview";
import { PrizeSlider } from "@/components/home/PrizeSlider";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCTA } from "@/components/home/FinalCTA";
import Link from "next/link";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col">
        {/* Hero */}
        <HomeHero />

        {/* Golden Match Banner */}
        <GoldenMatchesPreview />

        {/* Prize Bento */}
        <PrizeSlider />

        {/* Editorial flow + How it works + Points */}
        <HowItWorks />

        {/* International delivery */}
        <section className="py-12 bg-white">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#f5f5f7] rounded-2xl p-6 md:p-8 border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#e8f4fd] rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0071e3] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[#1d1d1f] text-lg">Entrega internacional</h3>
                  <p className="text-[#6e6e73] text-sm max-w-lg">Los premios se entregan en cualquier país. Coordinamos el envío con el ganador sin costo extra.</p>
                </div>
              </div>
              <p className="text-[#aeaeb2] text-sm shrink-0">ARG · URU · CHI · MEX · ESP · y más</p>
            </div>
          </div>
        </section>

        {/* Quick rules */}
        <section className="py-16 bg-[#f5f5f7]">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="mb-10 text-center">
              <span className="text-[#6e6e73] text-[11px] font-bold uppercase tracking-[0.2em] block mb-2">Transparente y claro</span>
              <h2 className="font-display font-bold text-[#1d1d1f] text-3xl tracking-tight">Reglas en 3 puntos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: "edit_calendar", title: "Una sola entrada", desc: "Se abona una vez, antes de que arranque el torneo. Sin cuotas ni pagos adicionales." },
                { icon: "lock", title: "Predicciones fijas", desc: "Una vez que empieza el torneo, los pronósticos se cierran y no se pueden modificar." },
                { icon: "emoji_events", title: "Gana el mejor", desc: "El ranking se determina 100% por puntos acumulados. Sin sorteos ni azar." },
              ].map((item) => (
                <div key={item.title} className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <span className="material-symbols-outlined text-[#d4a63a] text-2xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  <h3 className="font-display font-bold text-[#1d1d1f] text-base mb-2">{item.title}</h3>
                  <p className="text-[#6e6e73] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/reglas" className="text-[#0071e3] text-sm font-semibold hover:underline">Ver reglamento completo →</Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <FinalCTA />

        {/* Footer */}
        <footer className="bg-white border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <div className="max-w-[1180px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-display font-bold text-[#1d1d1f] text-sm">Mi Predicción · Mundial 2026</div>
            <div className="flex flex-wrap justify-center gap-6 text-[#6e6e73] text-[13px]">
              <Link href="/reglas" className="hover:text-[#0071e3] transition-colors">Reglas</Link>
              <Link href="/premios" className="hover:text-[#0071e3] transition-colors">Premios</Link>
              <Link href="/equipos" className="hover:text-[#0071e3] transition-colors">Equipos</Link>
              <Link href="/jugadores" className="hover:text-[#0071e3] transition-colors">Jugadores</Link>
              <Link href="/ranking" className="hover:text-[#0071e3] transition-colors">Ranking</Link>
              <Link href="/cuenta" className="hover:text-[#0071e3] transition-colors">Mi Cuenta</Link>
            </div>
            <div className="text-[#aeaeb2] text-[12px]">© 2026 · Competencia deportiva</div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
