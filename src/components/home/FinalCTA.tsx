"use client";
import React from "react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-20 bg-[#f5f5f7]">
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-[#e5e5e7] shadow-sm">
          <div className="w-12 h-12 rounded-3xl bg-[#e8f0fd] flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#0071e3] text-[22px]" style={{ fontVariationSettings:"'FILL' 1" }}>workspace_premium</span>
          </div>
          <h2 className="font-display font-bold text-[#1d1d1f] text-3xl md:text-[36px] tracking-tight mb-4">
            ¿Listo para demostrar que sos el que más sabe?
          </h2>
          <p className="text-[#6e6e73] text-[16px] mb-8 max-w-md mx-auto leading-relaxed">
            Probá 6 partidos gratis. Completá tu predicción oficial al activar tu participación.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/mi-prediccion"
              className="bg-[#0071e3] text-white font-semibold text-[16px] px-8 py-3.5 rounded-full hover:bg-[#0066cc] transition-colors active:scale-95 w-full sm:w-auto text-center shadow-sm">
              Crear mi predicción
            </Link>
            <Link href="/reglas" className="text-[#6e6e73] hover:text-[#1d1d1f] text-[14px] font-medium transition-colors">
              Leer las reglas →
            </Link>
          </div>
          <p className="text-[#aeaeb2] text-[12px] mt-5">
            Activá tu participación para competir · $5.000 ARS
          </p>
        </div>
      </div>
    </section>
  );
}
