"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { saveUserPredictions } from "@/app/actions/predictions";

const PREDICTION_DRAFT_KEY = "worldcup_prediction_draft";

export default function PagoExitoPage() {
  const [status, setStatus] = useState<"verificando" | "activo" | "error" | "pendiente">("verificando");
  const [synced, setSynced] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch("/api/payments/status");
        if (res.ok) {
          const data = await res.json();
          const paymentStatus = data.participation?.status || data.status;

          if (paymentStatus === "active") {
            setStatus("activo");
            if (intervalId) clearInterval(intervalId);

            // Trigger draft synchronization
            const rawDraft = localStorage.getItem(PREDICTION_DRAFT_KEY);
            if (rawDraft) {
              try {
                const parsed = JSON.parse(rawDraft);
                if (parsed && parsed.scores) {
                  const payload = Object.entries(parsed.scores).map(([matchId, score]) => {
                    const scoreObj = score as { home: number; away: number };
                    return {
                      match_id: Number(matchId),
                      home_goals: scoreObj.home !== undefined ? Number(scoreObj.home) : 0,
                      away_goals: scoreObj.away !== undefined ? Number(scoreObj.away) : 0
                    };
                  });

                  
                  if (payload.length > 0) {
                    const result = await saveUserPredictions(payload);
                    if (result.success) {
                      setSynced(true);
                      localStorage.removeItem(PREDICTION_DRAFT_KEY);
                    }
                  } else {
                    setSynced(true);
                  }
                } else {
                  setSynced(true);
                }
              } catch (err) {
                console.error("Error parsing local draft during post-payment sync:", err);
                setSynced(true); // Don't block user if parse fails
              }
            } else {
              setSynced(true);
            }
          } else if (paymentStatus === "pending" || paymentStatus === "pending_payment") {
            setStatus("pendiente");
          }
        }
      } catch (err) {
        console.error("Error fetching payment status:", err);
      }

      setAttempts((prev) => {
        // After 10 attempts (30 seconds), show pending screen if not active
        if (prev >= 10) {
          setStatus("pendiente");
          if (intervalId) clearInterval(intervalId);
        }
        return prev + 1;
      });
    };

    // Run first check immediately
    checkPaymentStatus();

    // Poll every 3 seconds
    intervalId = setInterval(checkPaymentStatus, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <AppShell>
      <main className="flex min-h-[75vh] items-center justify-center px-5 py-20 bg-[#f5f5f7]">
        <PremiumCard className="max-w-xl p-8 md:p-12 text-center space-y-6 shadow-xl border border-[rgba(0,0,0,0.04)] rounded-[32px]">
          
          {/* VERIFICANDO STATE */}
          {status === "verificando" && (
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
                Confirmando tu participación
              </h1>
              <p className="text-[15px] leading-relaxed text-[#6e6e73] max-w-sm mx-auto">
                Estamos procesando tu pago de forma segura. Tu cuenta se activará automáticamente en unos segundos.
              </p>
              <div className="pt-2 text-[12px] text-[#aeaeb2] font-semibold">
                Verificando estado... (Intento {attempts}/10)
              </div>
            </div>
          )}

          {/* ACTIVO STATE */}
          {status === "activo" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-[#34a853] text-white rounded-full flex items-center justify-center shadow-md animate-scaleUp">
                  <span className="material-symbols-outlined text-[36px] font-bold">check</span>
                </div>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
                ¡Participación activada!
              </h1>
              <p className="text-[15px] leading-relaxed text-[#6e6e73] max-w-md mx-auto">
                Tu pago fue aprobado con éxito. Tu cuenta ahora es premium y tu predicción oficial se encuentra guardada en nuestros servidores.
              </p>
              
              {synced ? (
                <div className="text-[13px] bg-[#e6f4ea] text-[#137333] py-2.5 px-4 rounded-full font-bold inline-flex items-center gap-1.5 mx-auto">
                  <span className="material-symbols-outlined text-[16px]">cloud_done</span>
                  <span>Borrador temporal sincronizado con éxito</span>
                </div>
              ) : (
                <div className="text-[13px] bg-[#fdf2e9] text-[#b06000] py-2.5 px-4 rounded-full font-bold inline-flex items-center gap-1.5 mx-auto">
                  <div className="w-3.5 h-3.5 border-2 border-[#b06000] border-t-transparent rounded-full animate-spin"></div>
                  <span>Sincronizando borrador local...</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link 
                  href="/cuenta" 
                  className="h-12 px-6 rounded-full bg-[#0071e3] text-white font-bold text-[14px] flex items-center justify-center hover:bg-[#0066cc] transition-all active:scale-[0.98]"
                >
                  Ir a mi cuenta
                </Link>
                <Link 
                  href="/mi-prediccion" 
                  className="h-12 px-6 rounded-full bg-white border border-[rgba(0,0,0,0.1)] text-[#1d1d1f] font-bold text-[14px] flex items-center justify-center hover:bg-[#f5f5f7] transition-all"
                >
                  Ver mi predicción
                </Link>
              </div>
            </div>
          )}

          {/* PENDIENTE/ERROR STATE */}
          {status === "pendiente" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-[#ff9f0a] text-white rounded-full flex items-center justify-center shadow-md animate-scaleUp">
                  <span className="material-symbols-outlined text-[36px] font-bold">warning</span>
                </div>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
                Confirmación pendiente
              </h1>
              <p className="text-[15px] leading-relaxed text-[#6e6e73] max-w-md mx-auto">
                Todavía estamos esperando la confirmación de tu pago por parte del proveedor. Esto puede demorar unos minutos.
              </p>
              
              <div className="bg-[#f5f5f7] rounded-[20px] p-5 text-left border border-[rgba(0,0,0,0.04)]">
                <p className="text-[13px] leading-relaxed text-[#6e6e73]">
                  No te preocupes, tu borrador sigue seguro en este dispositivo. Una vez confirmado, tu cuenta se activará automáticamente y se guardará tu predicción.
                </p>
                <p className="text-[13px] font-semibold text-[#1d1d1f] mt-3">
                  Contacto de soporte:{" "}
                  <a href="mailto:germangonzalezmdq@gmail.com" className="text-[#0071e3] hover:underline">
                    germangonzalezmdq@gmail.com
                  </a>
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Link 
                  href="/cuenta" 
                  className="h-12 px-8 rounded-full bg-[#0071e3] text-white font-bold text-[14px] flex items-center justify-center hover:bg-[#0066cc] transition-all active:scale-[0.98]"
                >
                  Ir a mi cuenta
                </Link>
              </div>
            </div>
          )}

        </PremiumCard>
      </main>
    </AppShell>
  );
}
