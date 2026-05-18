"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrizePaymentOptions } from "@/components/payments/PrizePaymentOptions";

const PREDICTION_DRAFT_KEY = "worldcup_prediction_draft";

type AccountUser = {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
};

type AccountSession = {
  status?: string;
  completed_matches?: number;
  top_scorer?: string;
  champion?: string;
};

type AccountRanking = {
  total_points?: number;
  global_rank?: number;
};

type LocalDraft = {
  completedMatchIds?: string[];
};

interface AccountDashboardClientProps {
  initialUser: AccountUser | null;
  initialSession: AccountSession | null;
  initialRanking: AccountRanking | null;
}

export function AccountDashboardClient({ initialUser, initialSession, initialRanking }: AccountDashboardClientProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"borrador" | "pendiente" | "activo">("borrador");
  const [localDraft, setLocalDraft] = useState<LocalDraft | null>(null);

  // Read hydration
  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setHasMounted(true);
      const raw = localStorage.getItem(PREDICTION_DRAFT_KEY);
      if (raw) {
        try {
          setLocalDraft(JSON.parse(raw));
        } catch (e) {
          console.error("Error parsing local draft", e);
        }
      }
    }, 0);

    return () => window.clearTimeout(mountTimer);
  }, []);

  // Fetch API payments status
  useEffect(() => {
    if (!initialUser) return;

    fetch("/api/payments/status")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        const status = data.participation?.status || data.status;
        if (status === "active") {
          setPaymentStatus("activo");
        } else if (status === "pending" || status === "pending_payment") {
          setPaymentStatus("pendiente");
        } else {
          setPaymentStatus("borrador");
        }
      })
      .catch(() => {
        // Fallback to initial status from session
        if (initialSession?.status === "active") {
          setPaymentStatus("activo");
        } else {
          setPaymentStatus("borrador");
        }
      });
  }, [initialUser, initialSession]);

  if (!hasMounted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center text-[#6e6e73]">
        Cargando tu cuenta...
      </div>
    );
  }

  // Not logged in
  if (!initialUser) {
    const localCompleted = localDraft?.completedMatchIds?.length || 0;
    const localRemaining = 104 - localCompleted;

    return (
      <div className="max-w-[820px] mx-auto px-5 md:px-6 py-10 md:py-16">
        <div className="text-center mb-10">
          <h1 className="font-display font-extrabold text-[#1d1d1f] text-[32px] tracking-tight mb-2">Mi cuenta</h1>
          <p className="text-[#6e6e73] text-[15px] max-w-sm mx-auto leading-relaxed">
            Iniciá sesión para guardar tu predicción, elegir goleador y campeón, y competir por el premio acumulado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <PremiumCard className="text-center">
              <span className="material-symbols-outlined text-[48px] text-[#8e8e93] mb-3">account_circle</span>
              <h3 className="font-bold text-lg text-[#1d1d1f] mb-1">Invitado</h3>
              <p className="text-[12px] text-[#6e6e73] mb-4">Borrador local temporal</p>
              <PremiumButton href="/login" className="w-full">Iniciar sesión</PremiumButton>
            </PremiumCard>

            <PremiumCard className="!p-5">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-[#aeaeb2] uppercase font-bold tracking-wider block">Partidos cargados</span>
                  <span className="font-display font-bold text-2xl text-[#1d1d1f]">{localCompleted} / 104</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#aeaeb2] uppercase font-bold tracking-wider block">Faltantes</span>
                  <span className="font-display font-bold text-2xl text-[#1d1d1f]">{localRemaining}</span>
                </div>
              </div>
            </PremiumCard>
          </div>

          <div className="md:col-span-2 space-y-6">
            <PremiumCard className="space-y-4">
              <h2 className="font-display font-extrabold text-[#1d1d1f] text-lg">Tu predicción</h2>
              <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                Tu predicción se guarda gratis de forma local en este dispositivo. Creá tu cuenta para asegurarla en la nube y competir.
              </p>
              <div className="flex gap-3">
                <Link href="/mi-prediccion" className="h-11 px-6 rounded-full bg-[#0071e3] text-white font-bold text-[13px] flex items-center justify-center hover:bg-[#0066cc] transition-colors">
                  Continuar cargando
                </Link>
              </div>
            </PremiumCard>

            <PrizePaymentOptions compact />
          </div>
        </div>
      </div>
    );
  }

  // Logged in
  const isActive = paymentStatus === "activo";
  const completedMatches = isActive ? (initialSession?.completed_matches || 0) : 0;
  const remainingMatches = 104 - completedMatches;
  
  // Custom stats
  const calculatedGroups = Math.floor(completedMatches / 8); // approximate calculation helper
  const topScorerChosen = isActive && initialSession?.top_scorer ? "Elegido" : "Pendiente";
  const championChosen = isActive && initialSession?.champion ? "Elegido" : "Pendiente";

  const localCompleted = localDraft?.completedMatchIds?.length || 0;

  const scrollToPaymentOptions = () => {
    const el = document.getElementById("payment-options-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-[1040px] mx-auto px-5 md:px-6 py-10 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Profile & Status */}
        <div className="md:col-span-1 space-y-6">
          <PremiumCard className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-[rgba(0,0,0,0.06)] overflow-hidden shrink-0 bg-[#e8f0fd]">
              {initialUser.user_metadata?.avatar_url ? (
                <img src={initialUser.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full text-[#0071e3] flex items-center justify-center font-bold text-xl uppercase">
                  {initialUser.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[#1d1d1f] text-lg truncate tracking-tight">
                {initialUser.user_metadata?.full_name || initialUser.email?.split('@')[0] || 'Usuario'}
              </h1>
              <p className="text-[#6e6e73] text-[13px] truncate mb-2">{initialUser.email}</p>
              
              {isActive ? (
                <StatusBadge variant="blue" icon="verified">
                  Participación activa
                </StatusBadge>
              ) : (
                <StatusBadge variant="gray" icon="warning">
                  Participación no activada
                </StatusBadge>
              )}
            </div>
          </PremiumCard>

          {/* Metrics grids - Only visible if active */}
          {isActive && (
            <>
              <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                <PremiumCard className="!p-4 text-center">
                  <span className="text-[10px] text-[#aeaeb2] uppercase font-bold tracking-wider block mb-1">Partidos</span>
                  <span className="font-display font-bold text-xl text-[#1d1d1f]">{completedMatches} / 104</span>
                </PremiumCard>
                <PremiumCard className="!p-4 text-center">
                  <span className="text-[10px] text-[#aeaeb2] uppercase font-bold tracking-wider block mb-1">Faltan</span>
                  <span className="font-display font-bold text-xl text-[#1d1d1f]">{remainingMatches}</span>
                </PremiumCard>
                <PremiumCard className="!p-4 text-center">
                  <span className="text-[10px] text-[#aeaeb2] uppercase font-bold tracking-wider block mb-1">Grupos</span>
                  <span className="font-display font-bold text-xl text-[#1d1d1f]">{calculatedGroups} / 12</span>
                </PremiumCard>
                <PremiumCard className="!p-4 text-center">
                  <span className="text-[10px] text-[#aeaeb2] uppercase font-bold tracking-wider block mb-1">Puntos</span>
                  <span className="font-display font-bold text-xl text-[#1d1d1f]">{initialRanking?.total_points || 0}</span>
                </PremiumCard>
              </div>

              <PremiumCard className="!p-5 space-y-4 animate-fadeIn">
                <h3 className="font-bold text-[14px] text-[#1d1d1f] uppercase tracking-wider">Pronósticos Especiales</h3>
                <div className="flex justify-between items-center py-2 border-b border-[rgba(0,0,0,0.04)]">
                  <span className="text-[13px] text-[#6e6e73]">Goleador del torneo</span>
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${initialSession?.top_scorer ? "bg-blue-50 text-[#0071e3]" : "bg-gray-50 text-[#6e6e73]"}`}>{topScorerChosen}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[13px] text-[#6e6e73]">Campeón del Mundo</span>
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${initialSession?.champion ? "bg-blue-50 text-[#0071e3]" : "bg-gray-50 text-[#6e6e73]"}`}>{championChosen}</span>
                </div>
              </PremiumCard>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Sections A-E or Checkout */}
        <div className="md:col-span-2 space-y-6">
          {!isActive ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Main alert callout */}
              <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[24px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-amber-600">
                  <span className="material-symbols-outlined text-[24px]">info</span>
                  <span className="font-bold text-[15px]">Participación no activada</span>
                </div>
                <p className="text-[#6e6e73] text-[13.5px] leading-relaxed">
                  Tu cuenta está creada, pero todavía no tenés una predicción oficial guardada. Para guardar tu Mundial y competir por el premio acumulado, activá tu inscripción.
                </p>
                
                <div id="payment-options-anchor" className="pt-2">
                  <PrizePaymentOptions compact />
                </div>
              </div>

              {/* Local draft recovery block */}
              {localCompleted > 0 && (
                <div className="bg-[rgba(255,159,10,0.03)] border border-[rgba(255,159,10,0.12)] rounded-[24px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-[#ff9f0a]">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                    <span className="font-bold text-[15px]">Borrador temporal detectado</span>
                  </div>
                  <p className="text-[#6e6e73] text-[13.5px] leading-relaxed">
                    Tenés una predicción de <span className="font-bold text-[#1d1d1f]">{localCompleted} partidos</span> cargada de forma local en este dispositivo. Activá tu participación para guardarla como predicción oficial en tu cuenta.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={scrollToPaymentOptions}
                      className="h-11 px-6 rounded-full bg-[#ff9f0a] hover:bg-[#e08905] text-white font-bold text-[13px] flex items-center justify-center transition-all active:scale-[0.98] shadow-sm"
                    >
                      Activar y guardar mi predicción
                    </button>
                    <Link
                      href="/mi-prediccion"
                      className="h-11 px-6 rounded-full bg-white border border-[rgba(0,0,0,0.1)] text-[#1d1d1f] font-bold text-[13px] flex items-center justify-center hover:bg-[#f5f5f7] transition-all"
                    >
                      Seguir probando predicción local
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Section A: Mi predicción */}
              <PremiumCard>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-[#1d1d1f] text-lg">A. Mi predicción</h3>
                  <Link href="/mi-prediccion" className="text-[13px] text-[#0071e3] font-semibold hover:underline">
                    {completedMatches === 104 ? "Ver resumen" : "Continuar cargando"}
                  </Link>
                </div>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed mb-4">
                  Tu predicción oficial está guardada. Llevas cargados {completedMatches} de los 104 partidos del fixture.
                </p>
                <div className="w-full bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#0071e3] h-full rounded-full transition-all duration-500" style={{ width: `${(completedMatches / 104) * 100}%` }}></div>
                </div>
              </PremiumCard>

              {/* Section B: Tablas por grupo */}
              <PremiumCard>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-[#1d1d1f] text-lg">B. Tablas por grupo</h3>
                  <Link href="/mi-prediccion" className="text-[13px] text-[#0071e3] font-semibold hover:underline">
                    Ver tablas completas
                  </Link>
                </div>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                  Las tablas de posiciones oficiales se calculan al instante a partir de tus marcadores cargados en el fixture.
                </p>
              </PremiumCard>

              {/* Section C: Goleador y campeón */}
              <PremiumCard>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-[#1d1d1f] text-lg">C. Goleador y campeón</h3>
                  <Link href="/mi-prediccion" className="text-[13px] text-[#0071e3] font-semibold hover:underline">
                    Completar pronósticos
                  </Link>
                </div>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                  Elegí a tu goleador del torneo y la selección campeona del mundo. Estos pronósticos otorgan puntos especiales en la tabla global.
                </p>
              </PremiumCard>

              {/* Section D: Premio acumulado */}
              <PremiumCard>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-[#1d1d1f] text-lg">D. Premio acumulado</h3>
                  <Link href="/premios" className="text-[13px] text-[#0071e3] font-semibold hover:underline">
                    Ver bolsa actual
                  </Link>
                </div>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                  El premio acumulado crece con cada nuevo participante oficial. Se distribuyen premios al finalizar la fase de grupos y la final del torneo.
                </p>
              </PremiumCard>

              {/* Section E: Grupos privados */}
              <PremiumCard>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-extrabold text-[#1d1d1f] text-lg">E. Grupos privados</h3>
                  <Link href="/grupos" className="text-[13px] text-[#0071e3] font-semibold hover:underline">
                    Crear grupo privado
                  </Link>
                </div>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                  Competí en tablas paralelas exclusivas con tu grupo de amigos, compañeros de oficina o familia.
                </p>
              </PremiumCard>
            </div>
          )}

          {/* Sign out */}
          <div className="flex justify-end pt-2">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
}
