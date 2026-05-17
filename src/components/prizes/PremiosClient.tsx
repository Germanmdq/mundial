"use client";
import React, { useEffect, useState } from "react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { PageHero } from "@/components/layout/PageHero";
import { PageSection } from "@/components/ui/PageSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrizePaymentOptions } from "@/components/payments/PrizePaymentOptions";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
  initialPrizes: PrizePack[];
  isLoggedIn: boolean;
}

export function PremiosClient({ initialPrizes, isLoggedIn }: PremiosClientProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"borrador" | "pendiente" | "activo">("borrador");

  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    if (!isLoggedIn) {
      return () => window.clearTimeout(mountTimer);
    }

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

    return () => window.clearTimeout(mountTimer);
  }, [isLoggedIn]);

  return (
    <>
      <PageHero 
        eyebrow="Premios"
        title="El premio crece con la competencia."
        description="Una bolsa inicial garantizada y una experiencia pensada para jugar entre amigos."
      />

      <PageSection>
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
            ) : paymentStatus === "pendiente" ? (
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

        {/* Main Prize Block */}
        <div className="mb-16">
          <PremiumCard className="bg-[#111827] border-0 text-center py-20 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: "radial-gradient(circle at 50% -20%, #c9a227 0%, transparent 60%)" }}></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[#c9a227] text-[13px] font-black uppercase tracking-[0.2em] mb-4">
                Premio Inicial Garantizado
              </span>
              <h2 className="text-white font-display font-extrabold text-[clamp(60px,10vw,120px)] leading-[0.9] tracking-tighter mb-6">
                <span className="text-[clamp(30px,5vw,60px)] align-top mr-2 text-white/50">$</span>
                550.000
              </h2>
              <p className="text-[#86868b] text-[16px] md:text-[18px] max-w-[500px] font-medium leading-relaxed mb-8">
                El pozo puede crecer con cada nuevo participante. Competí hasta el último partido del Mundial.
              </p>
              <PremiumButton href="/mi-prediccion" variant="primary" className="h-14 px-8 text-[16px]">
                Crear mi predicción
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>

        {!initialPrizes || initialPrizes.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              icon="redeem" 
              title="Premios en actualización" 
              description="Estamos preparando los premios oficiales. Vuelve pronto para conocerlos." 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialPrizes.map((prize, idx) => {
              const bgGradient = prize.slug === "pack-apple" 
                ? "linear-gradient(135deg, #1d1d1f 0%, #434347 100%)"
                : prize.slug === "pack-gamer-mundial"
                ? "linear-gradient(135deg, #0d0e15 0%, #1f2035 100%)"
                : prize.slug === "pack-living-mundial"
                ? "linear-gradient(135deg, #0071e3 0%, #005bb5 100%)"
                : prize.slug === "pack-creador"
                ? "linear-gradient(135deg, #f56300 0%, #e05300 100%)"
                : "linear-gradient(135deg, #0071e3 0%, #004499 100%)";

              const icon = prize.slug === "pack-apple" 
                ? "devices" 
                : prize.slug === "pack-gamer-mundial"
                ? "sports_esports"
                : prize.slug === "pack-living-mundial"
                ? "tv"
                : prize.slug === "pack-creador"
                ? "photo_camera"
                : "shopping_bag";

              return (
                <PremiumCard key={prize.id || idx} noPadding className="flex flex-col group cursor-default">
                  <div className="relative h-64 shrink-0 flex items-center justify-center overflow-hidden" style={{ background: bgGradient }}>
                    {prize.image_url ? (
                      <img
                        src={prize.image_url}
                        alt={prize.image_alt || prize.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                        <span className="material-symbols-outlined text-[64px] opacity-90 group-hover:scale-110 transition-transform duration-500 ease-out" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                          {icon}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Visual Placeholder</span>
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)" }} />
                    <div className="absolute top-5 left-5">
                      <span className="bg-white/95 backdrop-blur-md text-[#1d1d1f] text-[10px] font-bold uppercase tracking-[0.1em] px-3.5 py-1.5 rounded-full shadow-sm">
                        {prize.subtitle || "Tech Pack"}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-center bg-white">
                    <p className="text-[10px] font-bold text-[#aeaeb2] uppercase tracking-[0.15em] mb-1.5">{prize.disclaimer || 'Imagen referencial'}</p>
                    <h3 className="text-[#1d1d1f] font-extrabold text-2xl tracking-tight mb-2.5">{prize.title}</h3>
                    <p className="text-[#6e6e73] text-[15px] leading-relaxed">{prize.description || ""}</p>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </PageSection>
    </>
  );
}
