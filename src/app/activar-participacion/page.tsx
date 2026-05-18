"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PrizePaymentOptions } from "@/components/payments/PrizePaymentOptions";
import { createClient } from "@/lib/supabase/client";

function ActivarParticipacionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Payment status fields
  const [apiStatus, setApiStatus] = useState("");
  const [apiPaid, setApiPaid] = useState(false);
  const [apiPaymentStatusField, setApiPaymentStatusField] = useState("");
  const [isActive, setIsActive] = useState(false);
  
  // Debug toggle
  const [debugPayments, setDebugPayments] = useState(false);
  
  // Local Draft Count
  const [localDraftCount, setLocalDraftCount] = useState(0);

  useEffect(() => {
    // Check if debug mode is requested in URL
    if (searchParams.get("debugPayments") === "1" || searchParams.has("debugPayments")) {
      setTimeout(() => setDebugPayments(true), 0);
    }
  }, [searchParams]);

  useEffect(() => {
    // Retrieve local draft count
    if (typeof window !== "undefined") {
      try {
        const rawDraft = localStorage.getItem("prediction_draft_wc2026");
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          if (parsed && parsed.completedMatchIds) {
            setTimeout(() => setLocalDraftCount(parsed.completedMatchIds.filter(Boolean).length), 0);
          }
        }
      } catch (e) {
        console.error("Error reading local draft count", e);
      }
    }
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);
        setUserEmail(session.user.email || "");

        const res = await fetch("/api/payments/status");
        if (!res.ok) throw new Error();

        const data = await res.json();
        const part = data.participation;
        const statusVal = part?.status || data.status || "";
        const paidVal = part?.paid || data.paid || false;
        const payStatusVal = part?.payment_status || data.payment_status || "";

        setApiStatus(statusVal);
        setApiPaid(paidVal);
        setApiPaymentStatusField(payStatusVal);

        const calculatedIsActive = statusVal === "active" && paidVal === true && payStatusVal === "approved";
        setIsActive(calculatedIsActive);
      } catch (e) {
        console.error("Error checking payment status", e);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  // Redirect to prediction if active
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        router.push("/mi-prediccion");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isActive, router]);

  const canStartPayment = isLoggedIn && !isActive;
  const isPending = apiStatus === "pending_payment" || apiPaymentStatusField === "pending";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0071e3] mb-4"></div>
        <p className="text-[16px] text-[#6e6e73] font-bold">Preparando pasarela de pago...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[640px] mx-auto px-4 py-8 md:py-16 text-center animate-fade-in relative">
      
      {/* 1. ANONYMOUS LOCK GATE */}
      {!isLoggedIn ? (
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[32px] p-8 md:p-12 shadow-lg">
          <span className="material-symbols-outlined text-[54px] text-[#ff9f0a] mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
          <h2 className="text-2xl font-display font-black text-[#1d1d1f] mb-4">
            Necesitás iniciar sesión
          </h2>
          <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-8 max-w-sm mx-auto">
            Necesitás iniciar sesión para asociar el pago a tu participación.
          </p>
          <Link
            href="/login?redirect=/activar-participacion"
            className="inline-flex items-center justify-center w-full h-[52px] bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold rounded-full transition-all active:scale-[0.98] text-[15px]"
          >
            Ingresar para continuar
          </Link>
        </div>
      ) : isActive ? (
        
        // 2. ACTIVE USER RE-ROUTE
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[32px] p-8 md:p-12 shadow-lg">
          <span className="material-symbols-outlined text-[54px] text-[#34c759] mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <h2 className="text-2xl font-display font-black text-[#1d1d1f] mb-4">
            Tu participación ya está activa.
          </h2>
          <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-8">
            Redirigiéndote a tu predicción oficial...
          </p>
          <Link
            href="/mi-prediccion"
            className="inline-flex items-center justify-center w-full h-[52px] bg-[#34c759] hover:bg-[#28ad48] text-white font-bold rounded-full transition-all text-[15px]"
          >
            Continuar mi predicción
          </Link>
        </div>
      ) : (
        
        // 3. UNPAID / PENDING CARD AND PAYMENT BUTTONS
        <div className="space-y-6">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[48px] text-[#0071e3] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
            <h1 className="text-3xl font-display font-black text-[#1d1d1f] mb-3">
              Activá tu participación
            </h1>
            <p className="text-[#6e6e73] text-[15px] leading-relaxed max-w-md mx-auto">
              Para guardar tu predicción oficial, completar los 104 partidos y competir por el premio acumulado, activá tu participación.
            </p>
          </div>

          {/* Pending notification block */}
          {isPending && (
            <div className="bg-[#fffbeb] border border-[#fde8c3] rounded-[20px] p-4 text-left shadow-sm mb-6 flex gap-3 items-start animate-pulse">
              <span className="material-symbols-outlined text-[#d97706] shrink-0 mt-0.5">warning</span>
              <div>
                <p className="text-[13px] font-black text-[#b45309]">Pago en proceso</p>
                <p className="text-[12px] text-[#b45309] font-medium mt-1 leading-normal">
                  Tenés un pago pendiente de confirmación. Si no se completó, podés intentarlo nuevamente.
                </p>
              </div>
            </div>
          )}

          {/* Payment widgets */}
          <div className="bg-transparent text-left">
            <PrizePaymentOptions compact />
          </div>

          <p className="text-[#aeaeb2] text-[11px] leading-normal max-w-xs mx-auto mt-6">
            La participación se activa cuando el pago es confirmado por el proveedor.
          </p>
        </div>
      )}

      {/* 4. Payments Debug Panel */}
      {debugPayments && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1d1d1f] text-white border border-[rgba(255,255,255,0.15)] rounded-[20px] p-5 shadow-2xl max-w-sm font-sans text-[12px] space-y-3 animate-fadeIn text-left backdrop-blur-md bg-opacity-95">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] pb-2">
            <span className="font-extrabold text-[13px] tracking-tight flex items-center gap-1.5 text-[#ff9f0a]">
              <span className="material-symbols-outlined text-[16px]">bug_report</span>
              Payments Debug Panel
            </span>
            <button 
              onClick={() => setDebugPayments(false)} 
              className="text-[#aeaeb2] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Logged In:</span>
              <span className={isLoggedIn ? "text-emerald-400 font-bold" : "text-rose-400"}>
                {isLoggedIn ? "Yes" : "No"}
              </span>
            </div>
            {isLoggedIn && (
              <div className="flex justify-between gap-4">
                <span className="text-[#aeaeb2]">Email:</span>
                <span className="text-white truncate max-w-[180px]">{userEmail || "N/A"}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">API Status:</span>
              <span className="text-white font-bold">{apiStatus || "N/A"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">API Paid:</span>
              <span className={apiPaid ? "text-emerald-400 font-bold" : "text-[#aeaeb2]"}>
                {apiPaid ? "True" : "False"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">API Pay Status:</span>
              <span className="text-white font-bold">{apiPaymentStatusField || "N/A"}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[rgba(255,255,255,0.1)] pt-1.5">
              <span className="text-[#aeaeb2]">isActive:</span>
              <span className={isActive ? "text-emerald-400 font-black" : "text-rose-400 font-bold"}>
                {isActive ? "ACTIVE" : "UNPAID"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">canStartPayment:</span>
              <span className={canStartPayment ? "text-emerald-400 font-black" : "text-rose-400 font-bold"}>
                {canStartPayment ? "TRUE" : "FALSE"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#aeaeb2]">Local Draft Count:</span>
              <span className="text-white">{localDraftCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivarParticipacionPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0071e3] mb-4"></div>
          <p className="text-[16px] text-[#6e6e73] font-bold">Cargando...</p>
        </div>
      }>
        <ActivarParticipacionClient />
      </Suspense>
    </AppShell>
  );
}
