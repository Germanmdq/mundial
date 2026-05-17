import React from "react";
import Link from "next/link";
import { getPrizePacks } from "@/lib/worldcup/prizes";
import { EmptyState } from "@/components/ui/EmptyState";

export async function PrizeSlider() {
  const prizes = await getPrizePacks();

  if (!prizes || prizes.length === 0) {
    return (
      <section className="py-20 bg-[#f5f5f7]">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block mb-2">Gran Premio · Fase de Grupos</span>
              <h2 className="font-display font-bold text-[#1d1d1f] text-3xl md:text-4xl tracking-tight">
                Elegí tu premio si ganás<br className="hidden md:block" /> la fase de grupos
              </h2>
            </div>
          </div>
          <EmptyState 
            icon="redeem" 
            title="Premios en actualización" 
            description="Estamos preparando los premios oficiales. Vuelve pronto para conocerlos." 
          />
        </div>
      </section>
    );
  }

  // Calculate spans for bento grid if needed
  const getSpan = (index: number) => {
    if (index === 0 || index === 1) return "md:col-span-3";
    return "md:col-span-2";
  };

  return (
    <section className="py-20 bg-[#f5f5f7]">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block mb-2">Gran Premio · Fase de Grupos</span>
            <h2 className="font-display font-bold text-[#1d1d1f] text-3xl md:text-4xl tracking-tight">
              Elegí tu premio si ganás<br className="hidden md:block" /> la fase de grupos
            </h2>
          </div>
          <Link href="/premios" className="text-[#0071e3] text-[14px] font-semibold hover:underline flex items-center gap-1 shrink-0">
            Ver todos
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Desktop bento */}
        <div className="hidden md:grid grid-cols-6 gap-3 auto-rows-[240px]">
          {prizes.map((p, i) => (
            <div key={p.id} className={`${getSpan(i)} relative rounded-2xl overflow-hidden group cursor-pointer border border-[#e5e5e7] shadow-sm`}>
              {p.image_url && (
                <img src={p.image_url} alt={p.image_alt || p.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              )}
              <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }} />
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 text-[#1d1d1f] text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">{p.subtitle || 'Premio'}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">{p.disclaimer || 'Imagen referencial'}</p>
                <h3 className="text-white font-bold text-base">{p.title}</h3>
                <p className="text-white/70 text-[13px]">{p.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile scroll */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth:"none" }}>
            {prizes.map((p) => (
              <div key={p.id} className="flex-none w-[78vw] max-w-[300px] snap-start rounded-2xl overflow-hidden border border-[#e5e5e7] shadow-sm bg-white">
                <div className="relative h-44 bg-[#f0f0f2]">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.image_alt || p.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
                  <span className="absolute top-2.5 left-3 bg-white/90 text-[#1d1d1f] text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">{p.subtitle || 'Premio'}</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[9px] text-[#aeaeb2] uppercase tracking-widest mb-0.5">{p.disclaimer || 'Imagen referencial'}</p>
                  <h3 className="text-[#1d1d1f] font-bold text-[15px]">{p.title}</h3>
                  <p className="text-[#6e6e73] text-[13px] mt-0.5">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {prizes.map((p,i) => (
              <div key={p.id} className={`rounded-full ${i===0?"w-4 h-1.5 bg-[#0071e3]":"w-1.5 h-1.5 bg-[#d1d1d6]"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
