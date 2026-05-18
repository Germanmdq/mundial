"use client";
import React, { useEffect, useState } from "react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { PrizePaymentOptions } from "@/components/payments/PrizePaymentOptions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrizePoolBanner } from "@/components/prizes/PrizePoolBanner";

interface PrizePack {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  disclaimer?: string | null;
}

interface PremiosClientProps {
  initialPrizes?: unknown;
  isLoggedIn?: boolean;
}

export function PremiosClient({ initialPrizes, isLoggedIn }: PremiosClientProps = {}) {
  const [hasMounted, setHasMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"borrador" | "pendiente" | "activo">("borrador");
  const [isDebugPayments, setIsDebugPayments] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasMounted(true);
      if (typeof window !== "undefined") {
        setIsDebugPayments(window.location.search.includes("debugPayments=1"));
      }
    }, 0);

    fetch("/api/payments/status")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        const status = data.participation?.status || data.status;
        if (status === "active") {
          setPaymentStatus("activo");
        } else if (status === "pending" || status === "pending_payment") {
          setPaymentStatus("pendiente");
        } else {
          setPaymentStatus("borrador");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero 
        eyebrow="Premios"
        title="El premio crece con la competencia."
        description="Una bolsa inicial garantizada y una experiencia pensada para jugar entre amigos."
      />

      <PageSection>
        {/* Dynamic Real-time Prize Pool Accumulator */}
        <PrizePoolBanner />

        {/* Payment CTA Banner */}
        {hasMounted && (
          <div className="mb-10 max-w-[720px] mx-auto animate-fade-in">
            {paymentStatus === "activo" ? (
              <PremiumCard className="!p-5 bg-blue-50 border border-[rgba(0,113,227,0.12)] text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-[#e8f0fd] rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#0071e3] text-xl">verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px]">Participación activa</h4>
                    <p className="text-[13px] text-[#6e6e73]">Ya estás compitiendo de manera oficial por el premio acumulado.</p>
                  </div>
                </div>
                <StatusBadge variant="blue" icon="check">Activo</StatusBadge>
              </PremiumCard>
            ) : (paymentStatus === "pendiente" && isDebugPayments) ? (
              <PremiumCard className="!p-5 bg-amber-50 border border-amber-100 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-amber-100/50 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600 text-xl">pending</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px]">Pago pendiente de confirmación</h4>
                    <p className="text-[13px] text-[#6e6e73]">Estamos procesando tu pago. Tu participación se activará en breve.</p>
                  </div>
                </div>
                <StatusBadge variant="gold" icon="hourglass_empty">Pendiente</StatusBadge>
              </PremiumCard>
            ) : (
              <div className="space-y-4">
                <PrizePaymentOptions compact={false} source="prizes" />
              </div>
            )}
          </div>
        )}

        {/* Secciones de Premios Oficiales y Reglas */}
        <div className="space-y-12">
          
          {/* Tarjeta de Distribución de Premios */}
          <div className="w-full">
            <PremiumCard className="bg-[#111827] border-0 py-12 px-6 md:px-12 relative overflow-hidden flex flex-col items-center shadow-2xl">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: "radial-gradient(circle at 50% -20%, #c9a227 0%, transparent 60%)" }}></div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
                <span className="text-[#c9a227] text-[12px] font-black uppercase tracking-[0.25em] mb-4">
                  Distribución del Pozo Acumulado
                </span>
                <h3 className="text-white font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-8 leading-tight">
                  Premios Oficiales del Torneo
                </h3>
                <p className="text-[#8e8e93] text-[15px] leading-relaxed mb-10">
                  Todo lo recaudado mediante las inscripciones se acumula en un pozo común que se repartirá de la siguiente manera al finalizar la competencia:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center">
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col items-center justify-center">
                    <span className="text-[#c9a227] text-[10px] font-black uppercase tracking-wider mb-2 block">Ranking General</span>
                    <span className="text-white font-display font-black text-5xl leading-none block mb-2">70%</span>
                    <span className="text-[12px] text-[#8e8e93]">Del pozo total</span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col items-center justify-center">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-2 block">Campeón del Mundial</span>
                    <span className="text-white font-display font-black text-5xl leading-none block mb-2">15%</span>
                    <span className="text-[12px] text-[#8e8e93]">Del pozo total</span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col items-center justify-center">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-2 block">Goleador del torneo</span>
                    <span className="text-white font-display font-black text-5xl leading-none block mb-2">15%</span>
                    <span className="text-[12px] text-[#8e8e93]">Del pozo total</span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Grid de Reglas y Puntos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Tarjeta de Sistema de Puntos */}
            <PremiumCard className="bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">
              <span className="text-[#0071e3] text-[11px] font-black uppercase tracking-wider mb-2 block">Sistema de Puntuación</span>
              <h3 className="text-[#1d1d1f] font-extrabold text-2xl tracking-tight mb-6">¿Cómo sumás puntos?</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#e8f0fd] text-[#0071e3] font-bold text-sm flex items-center justify-center shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-0.5">Marcador Exacto</h4>
                    <p className="text-[13px] text-[#6e6e73] leading-relaxed">Acertás el ganador/empate y la cantidad exacta de goles de ambos equipos (ej: pronóstico 2-1, resultado 2-1).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm flex items-center justify-center shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-0.5">Tendencia + diferencia</h4>
                    <p className="text-[13px] text-[#6e6e73] leading-relaxed">Acertás el ganador o empate y además acertás la diferencia exacta de goles (ej: pronóstico 3-1, resultado 2-0).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-0.5">Solo tendencia</h4>
                    <p className="text-[13px] text-[#6e6e73] leading-relaxed">Acertás únicamente si el partido termina en victoria local, visitante o empate (ej: pronóstico 2-1, resultado 1-0).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-3 border-t border-[rgba(0,0,0,0.04)]">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center shrink-0">0</div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-0.5">Incorrecto</h4>
                    <p className="text-[13px] text-[#6e6e73] leading-relaxed">No acertás ni el resultado ni la tendencia del encuentro.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-3 border-t border-[rgba(0,0,0,0.04)]">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 font-bold text-sm flex items-center justify-center shrink-0">💡</div>
                  <div>
                    <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-0.5">Pronósticos Especiales</h4>
                    <p className="text-[13px] text-[#6e6e73] leading-relaxed">Campeón y goleador no suman puntos al ranking general. Participan por premios separados y se habilitarán en la segunda etapa.</p>
                  </div>
                </div>
              </div>
            </PremiumCard>

            {/* Tarjeta de Formatos por Fase y Desempates */}
            <PremiumCard className="bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">
              <span className="text-[#ff9500] text-[11px] font-black uppercase tracking-wider mb-2 block">Reglamento Oficial</span>
              <h3 className="text-[#1d1d1f] font-extrabold text-2xl tracking-tight mb-6">Reglas por Fase y Desempates</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-1.5">Fase de Grupos (Sin penales)</h4>
                  <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                    Los encuentros de fase de grupos pueden terminar en empate tras los 90 minutos reglamentarios. El pronóstico es el resultado de los 90 minutos reglamentarios. No se consideran penales.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#1d1d1f] text-[15px] mb-1.5">Playoffs (Eliminatorias)</h4>
                  <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                    Se habilitan en la segunda etapa.
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(0,0,0,0.04)]">
                  <h4 className="font-bold text-[#1d1d1f] text-[14px] uppercase tracking-wider text-[#8e8e93] mb-3">Jerarquía de Desempate en Ranking</h4>
                  <ul className="text-[13px] text-[#6e6e73] space-y-2 list-decimal pl-4 leading-relaxed">
                    <li>Mayor cantidad de marcadores exactos acertados (predicciones de 5 puntos).</li>
                    <li>Mayor cantidad de diferencias de gol correctas (predicciones de 4 puntos).</li>
                    <li>Fecha y hora de activación del pago de participación (quien pagó primero).</li>
                  </ul>
                </div>
              </div>
            </PremiumCard>

          </div>

        </div>
      </PageSection>
    </>
  );
}
