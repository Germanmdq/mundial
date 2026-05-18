"use client";
import React, { useState } from "react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { startMercadoPagoCheckout, startPayPalCheckout } from "@/lib/payments/client";

interface PrizePaymentOptionsProps {
  compact?: boolean;
  source?: "prediction" | "account" | "prizes";
}

export function PrizePaymentOptions({ compact = false, source: _source = "prediction" }: PrizePaymentOptionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorProvider, setErrorProvider] = useState<"mercadopago" | "paypal" | null>(null);

  const handleMercadoPago = () => {
    setErrorProvider(null);
    startMercadoPagoCheckout(setLoading, (message) => {
      setError(message);
      setErrorProvider(message ? "mercadopago" : null);
    });
  };

  const handlePayPal = () => {
    setErrorProvider(null);
    startPayPalCheckout(setLoading, (message) => {
      setError(message);
      setErrorProvider(message ? "paypal" : null);
    });
  };

  return (
    <div className={`w-full ${compact ? "max-w-md mx-auto" : "max-w-[720px] mx-auto"} animate-fade-in`}>
      <PremiumCard className="relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-[#e8f0fd] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[#0071e3] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          </div>
          <h3 className="font-display font-extrabold text-[#1d1d1f] text-lg tracking-tight mb-1">
            Activá tu participación
          </h3>
          <p className="text-[#6e6e73] text-[13px] leading-relaxed max-w-sm mx-auto">
            Guardá tu predicción oficial y competí por el premio acumulado.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-[16px] border border-[rgba(255,59,48,0.18)] bg-[#fff2f2] p-4 text-left text-[#b42318] shadow-sm">
            <p className="text-[13px] font-black">
              {errorProvider === "paypal" ? "No pudimos abrir PayPal." : "No pudimos iniciar el pago."}
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-[12px] font-semibold leading-5">
              {error}
            </p>
            {errorProvider === "paypal" ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePayPal}
                  disabled={loading}
                  className="rounded-full bg-[#1d1d1f] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Intentar nuevamente
                </button>
                <p className="self-center text-[12px] font-semibold text-[#6e6e73]">
                  También podés pagar con Mercado Pago.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-[rgba(0,113,227,0.06)] border border-[rgba(0,113,227,0.12)] rounded-[12px] text-[#0071e3] text-[13px] font-bold text-center flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-[#0071e3] border-t-transparent rounded-full"></span>
            Redirigiendo al pago...
          </div>
        )}

        <div className={`grid ${compact ? "grid-cols-1 gap-3" : "grid-cols-1 sm:grid-cols-2 gap-4"}`}>
          {/* Mercado Pago */}
          <div className="bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)] rounded-[20px] p-5 flex flex-col items-center text-center justify-between">
            <div className="mb-4">
              <span className="text-[10px] font-black text-[#8e8e93] uppercase tracking-wider block mb-1">Argentina</span>
              <span className="font-display font-black text-[22px] text-[#1d1d1f] leading-none">$5.000 <span className="text-[12px] text-[#6e6e73] font-medium">ARS</span></span>
              <span className="text-[11px] font-bold text-[#009ee3] block mt-1">Mercado Pago</span>
            </div>
            <button
              onClick={handleMercadoPago}
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#0071e3] text-white font-bold text-[13px] hover:bg-[#0066cc] transition-colors shadow-sm disabled:opacity-50 active:scale-[0.98]"
            >
              Pagar con Mercado Pago
            </button>
          </div>

          {/* PayPal */}
          <div className="bg-[#1d1d1f] border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5 flex flex-col items-center text-center justify-between text-white">
            <div className="mb-4">
              <span className="text-[10px] font-black text-[#8e8e93] uppercase tracking-wider block mb-1">Internacional</span>
              <span className="font-display font-black text-[22px] text-white leading-none">USD 5</span>
              <span className="text-[11px] font-bold text-[#003087] block mt-1">PayPal</span>
            </div>
            <button
              onClick={handlePayPal}
              disabled={loading}
              className="w-full h-11 rounded-full bg-white text-[#1d1d1f] font-bold text-[13px] hover:bg-[#f5f5f7] transition-colors shadow-sm disabled:opacity-50 active:scale-[0.98]"
            >
              Pagar con PayPal
            </button>
          </div>
        </div>

        <p className="text-center text-[#aeaeb2] text-[10px] font-medium mt-5 leading-normal max-w-[280px] mx-auto">
          La predicción oficial se guarda cuando el pago es confirmado por el proveedor.
        </p>
      </PremiumCard>
    </div>
  );
}
