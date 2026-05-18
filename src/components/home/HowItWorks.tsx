"use client";
import React from "react";

const STEPS = [
  { num:"01", icon:"edit_note",   title:"Creás tu predicción gratis",       desc:"Probás 6 partidos gratis para sentir la experiencia sin pagar." },
  { num:"02", icon:"sports_soccer", title:"Cargás resultados", desc:"Partido a partido, grupo a grupo, completás tu fixture." },
  { num:"03", icon:"emoji_events", title:"Finalizás tu fase de grupos",      desc:"Completás los 72 partidos y confirmás tu predicción." },
  { num:"04", icon:"stars",        title:"Activás tu participación oficial", desc:"Un solo pago. Entrás al ranking real y competís por premios." },
  { num:"05", icon:"leaderboard",  title:"Competís y ganás",                desc:"Cada acierto suma puntos. Los mejores de cada fase ganan." },
];

const POINTS = [
  { label:"Marcador Exacto", desc:"Acertás el resultado exacto (ej: 2-1)", pts:"5 pts" },
  { label:"Diferencia de Goles", desc:"Acertás tendencia y diferencia (ej: 2-1 y sale 1-0)", pts:"4 pts" },
  { label:"Solo Tendencia",      desc:"Acertás ganador o empate (ej: 2-1 y sale 3-0)",  pts:"3 pts" },
  { label:"Golden Match",     desc:"Puntos dobles en partidos seleccionados", pts:"×2 Bonus" },
];

export function HowItWorks() {
  return (
    <>
      {/* Two editorial cards */}
      <section className="py-16 bg-white">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon:"edit_note",   bg:"#e8f4e8", ic:"#34a853", title:"Primero probás tu Mundial",
                text:"Probá 6 partidos gratis. Experimentá cargar tus resultados de forma local antes de activar tu participación." },
              { icon:"emoji_events", bg:"#e8f0fd", ic:"#0071e3", title:"Después activás tu participación",
                text:"Para completar la fase de grupos, guardar tu predicción oficial y competir por el premio acumulado, activá tu participación." },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-3xl p-8 border border-[#e5e5e7] shadow-sm">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5" style={{ background:c.bg }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color:c.ic, fontVariationSettings:"'FILL' 1" }}>{c.icon}</span>
                </div>
                <h3 className="font-display font-bold text-[#1d1d1f] text-[18px] mb-2">{c.title}</h3>
                <p className="text-[#6e6e73] text-[15px] leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="como-funciona" className="py-20 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="mb-12 text-center">
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block mb-2">Simple y sin vueltas</span>
            <h2 className="font-display font-bold text-[#1d1d1f] text-3xl md:text-[38px] tracking-tight">Cómo se juega</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col items-start sm:items-center sm:text-center">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#e5e5e7] flex items-center justify-center mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-[#6e6e73]" style={{ fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-[#aeaeb2] uppercase tracking-widest mb-1">{s.num}</span>
                <h3 className="font-display font-bold text-[#1d1d1f] text-[13px] mb-1">{s.title}</h3>
                <p className="text-[#6e6e73] text-[12px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Points */}
      <section className="py-20 bg-white">
        <div className="max-w-[680px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block mb-2">La precisión es recompensada</span>
            <h2 className="font-display font-bold text-[#1d1d1f] text-3xl tracking-tight">Sistema de Puntos</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#e5e5e7] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f0f0f2] bg-[#f5f5f7]">
                  <th className="px-5 py-3.5 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">Acierto</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide hidden sm:table-cell">Descripción</th>
                  <th className="px-5 py-3.5 text-[12px] font-semibold text-[#0071e3] uppercase tracking-wide text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {POINTS.map((r, i) => (
                  <tr key={r.label} className={i < POINTS.length - 1 ? "border-b border-[#f0f0f2]" : ""}>
                    <td className="px-5 py-4 text-[14px] text-[#1d1d1f] font-medium">{r.label}</td>
                    <td className="px-5 py-4 text-[14px] text-[#6e6e73] hidden sm:table-cell">{r.desc}</td>
                    <td className="px-5 py-4 text-[14px] font-bold text-[#0071e3] text-right">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
