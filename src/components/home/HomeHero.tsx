import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function HomeHero() {
  const supabase = await createClient();
  
  // Try to get actual participant count
  const { count: participantsCount } = await supabase
    .from('prediction_sessions')
    .select('*', { count: 'exact', head: true });
    
  const hasParticipants = participantsCount && participantsCount > 0;

  return (
    <section className="pt-14 bg-white">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16 py-20 md:py-28">

          {/* LEFT */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-7 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#e8f0fd] text-[#0071e3] border border-[#c8dcfa]">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
              PRE-VENTA EXCLUSIVA
            </div>

            <h1 className="font-display font-extrabold tracking-tight text-[#1d1d1f] leading-[1.04] mb-6"
              style={{ fontSize: "clamp(38px, 5.5vw, 68px)" }}>
              MI PREDICCIÓN<br />
              <span className="text-[#0071e3]">MUNDIAL 2026</span>
            </h1>

            <p className="text-[#6e6e73] text-[17px] md:text-[19px] leading-relaxed mb-3 max-w-[480px] mx-auto md:mx-0">
              Armá tu Mundial. Predecí cada partido de la fase de grupos.
            </p>
            <p className="text-[#6e6e73] text-[15px] mb-9 max-w-[440px] mx-auto md:mx-0">
              Probá 6 partidos gratis. Para completar la fase de grupos y guardar tu predicción oficial, activá tu participación.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-6">
              <Link href="/mi-prediccion"
                className="bg-[#0071e3] text-white font-semibold text-[16px] px-7 py-3.5 rounded-full hover:bg-[#0066cc] transition-colors active:scale-95 text-center shadow-sm">
                Crear mi predicción
              </Link>
              <Link href="/premios"
                className="text-[#0071e3] font-semibold text-[16px] px-7 py-3.5 rounded-full border border-[#c8dcfa] hover:bg-[#e8f0fd] transition-colors text-center">
                Ver premios
              </Link>
            </div>

            <p className="text-[#aeaeb2] text-[13px] max-w-[420px] mx-auto md:mx-0">
              La participación oficial requiere un pago único para activarse.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 mt-8 pt-8 border-t border-[#f0f0f2]">
              {hasParticipants && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#0071e3] text-[16px]" style={{ fontVariationSettings:"'FILL' 1" }}>groups</span>
                  <span className="text-[#6e6e73] text-[13px]">+{participantsCount} participantes</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0071e3] text-[16px]" style={{ fontVariationSettings:"'FILL' 1" }}>verified</span>
                <span className="text-[#6e6e73] text-[13px]">Competencia oficial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0071e3] text-[16px]" style={{ fontVariationSettings:"'FILL' 1" }}>public</span>
                <span className="text-[#6e6e73] text-[13px]">Entrega internacional</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-shrink-0 w-full md:w-[420px] relative mt-6 md:mt-0">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-[#e5e5e7]">
              <div className="relative h-56 md:h-64 bg-[#f0f0f2]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNbVz4DmAP4HawrGSMrM-Xa9lMXKM-tEkPePj8mHoYRE-MEzlhg1VAILLkh4CSlYK1OfiKqkNsmFoDzkGD5Y3C7PQR96zA5vhq3UW16E711JPXO-inyAe__FGWtRHkPRrn5iFLgZXqGLLUc-vEVNSQqb5bOs5OGqvF_X4GjyztEAl9wd9KWO5Unq078FDpogJenU8xoC9yID9MkeHqIK66jfFy4N5gO7R5XNGdh8Kf_QEaSZ9ljbEOFDSViwOqqQgNkJIT3BPdyrEN"
                  alt="Pack Apple Premio"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] text-white/60 uppercase tracking-widest block">Gran Premio · Fase de Grupos</span>
                  <span className="font-display font-bold text-white text-lg">Tecnología Premium</span>
                </div>
              </div>
              <div className="bg-white px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73] text-[13px]">Premios a elección</span>
                  <span className="text-[11px] text-[#aeaeb2] uppercase tracking-wide">Imagen referencial</span>
                </div>
              </div>
            </div>

            {/* Floating pill — ranking (only show if we have data) */}
            {hasParticipants && (
              <div className="absolute -bottom-5 -left-3 md:-left-6 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-lg border border-[#e5e5e7]">
                <div className="w-8 h-8 rounded-xl bg-[#e8f0fd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#0071e3] text-[16px]" style={{ fontVariationSettings:"'FILL' 1" }}>leaderboard</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#aeaeb2] font-medium">Ranking Global</div>
                  <div className="font-display font-bold text-[#1d1d1f] text-[14px]">Activo</div>
                </div>
              </div>
            )}

            {/* Floating pill — points (only show if we have data) */}
            {hasParticipants && (
              <div className="absolute -top-4 -right-2 md:-right-5 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-lg border border-[#e5e5e7]">
                <div className="w-8 h-8 rounded-xl bg-[#e8f4e8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#34a853] text-[16px]" style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#aeaeb2] font-medium">Competencia</div>
                  <div className="font-display font-bold text-[#1d1d1f] text-[14px]">En progreso</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
