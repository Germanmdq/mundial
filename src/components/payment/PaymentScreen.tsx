"use client";
import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { cn } from "@/lib/utils";

const INCLUDES = [
  "Ranking oficial durante todo el torneo",
  "Gran Premio Fase de Grupos",
  "Partidos Dorados (puntos dobles)",
  "Premios por eliminatorias",
  "Predicción guardada en tu cuenta",
  "Historial de puntos y resultados",
];

export function PaymentScreen({ userId }: { userId: string | null }) {
  const [checks, setChecks] = useState({ rules: false, prizes: false, privacy: false });
  const [method, setMethod] = useState<"mp" | "pp" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const supabase = createClient();
  
  const allChecked = checks.rules && checks.prizes && checks.privacy;
  const toggle = (k: keyof typeof checks) => setChecks((c) => ({ ...c, [k]: !c[k] }));

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-16">
        <div className="max-w-[620px] mx-auto px-6">
          <Link href="/mi-prediccion" className="inline-flex items-center gap-1 text-[#0071e3] text-[13px] font-medium mb-8 hover:underline">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver
          </Link>
          <EmptyState 
            icon="lock" 
            title="Iniciá sesión" 
            description="Para activar tu participación necesitás iniciar sesión."
          />
          <div className="flex justify-center mt-6">
            <PremiumButton href="/login">Iniciar sesión</PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptTerms = async () => {
    if (!allChecked || !userId) return;
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const { error } = await supabase.from('user_terms_acceptance').upsert({
        user_id: userId,
        accepted_rules: checks.rules,
        accepted_prize_terms: checks.prizes,
        accepted_privacy: checks.privacy,
        accepted_at: new Date().toISOString(),
        version: '1.0'
      });
      
      if (error) throw error;
      setSaveStatus('success');
    } catch (err) {
      console.error('Error saving terms:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 pb-16">
      <div className="max-w-[620px] mx-auto px-5 sm:px-6">
        <Link href="/mi-prediccion" className="inline-flex items-center gap-1 text-[#0071e3] text-[13px] font-semibold mb-8 hover:underline bg-[#e8f0fd] px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver
        </Link>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#e8f0fd] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <span className="material-symbols-outlined text-[#0071e3] text-[22px]" style={{ fontVariationSettings:"'FILL' 1" }}>emoji_events</span>
          </div>
          <h1 className="font-display font-extrabold text-[#1d1d1f] text-[32px] tracking-tight mb-2">Activá tu participación</h1>
          <p className="text-[#6e6e73] text-[15px] max-w-sm mx-auto leading-relaxed">
            Tu predicción ya está lista. Ahora podés entrar al ranking oficial y competís por premios.
          </p>
        </div>

        {/* Product card */}
        <PremiumCard noPadding className="mb-6">
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-[rgba(0,0,0,0.06)] bg-[#fbfbfd]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#0071e3] uppercase tracking-[0.18em] block mb-2 bg-[#e8f0fd] w-fit px-2.5 py-1 rounded-full">Participación oficial</span>
                <h2 className="font-display font-extrabold text-[#1d1d1f] text-[20px] tracking-tight">Mi Predicción Mundial 2026</h2>
                <p className="text-[#6e6e73] text-[13px] mt-1 font-medium">Entrada única · Acceso completo</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display font-extrabold text-[#1d1d1f] text-[28px]">$5.000</span>
                <span className="text-[#6e6e73] text-[13px] block font-medium">ARS</span>
              </div>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-6">
            <p className="text-[11px] font-bold text-[#aeaeb2] uppercase tracking-[0.15em] mb-4">Incluye</p>
            <ul className="space-y-3">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0071e3] text-[18px]" style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>
                  <span className="text-[#1d1d1f] text-[14px] font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </PremiumCard>

        {/* Checkboxes */}
        <PremiumCard className="mb-6">
          <div className="space-y-4">
            {[
              { k:"rules"   as const, text:"Acepto las", link:"/reglas", lt:"Reglas y Condiciones" },
              { k:"prizes"  as const, text:"Acepto las condiciones de premios", link:"/reglas", lt:"Ver detalle" },
              { k:"privacy" as const, text:"Acepto la política de privacidad", link:"/reglas", lt:"Ver detalle" },
            ].map((item) => (
              <label key={item.k} className="flex items-start gap-3 cursor-pointer group">
                <div onClick={() => toggle(item.k)}
                  className="w-[22px] h-[22px] rounded-[6px] border flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={{ 
                    borderColor: checks[item.k] ? "#0071e3" : "rgba(0,0,0,0.15)", 
                    background: checks[item.k] ? "#0071e3" : "white",
                    boxShadow: checks[item.k] ? "0 2px 8px rgba(0,113,227,0.3)" : "none"
                  }}>
                  {checks[item.k] && <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings:"'FILL' 1" }}>check</span>}
                </div>
                <span className="text-[14px] text-[#1d1d1f] font-medium group-hover:text-black transition-colors">
                  {item.text} <Link href={item.link} className="text-[#0071e3] hover:underline font-semibold">{item.lt}</Link>
                </span>
              </label>
            ))}
          </div>
        </PremiumCard>

        {/* Payment methods */}
        <PremiumCard className="mb-8">
          <p className="text-[11px] font-bold text-[#aeaeb2] uppercase tracking-[0.15em] mb-4">Método de pago</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { id:"mp" as const, label:"Mercado Pago", sub:"Tarjeta / Efectivo",  color:"#009ee3" },
              { id:"pp" as const, label:"PayPal",        sub:"Internacional",       color:"#003087" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className="flex flex-col items-center justify-center gap-1.5 border rounded-[20px] py-6 transition-all active:scale-95"
                style={{ 
                  borderColor: method === m.id ? "#0071e3" : "rgba(0,0,0,0.08)", 
                  background: method === m.id ? "#e8f0fd" : "white",
                  boxShadow: method === m.id ? "0 4px 12px rgba(0,113,227,0.15)" : "0 2px 8px rgba(0,0,0,0.02)"
                }}>
                <span className="font-display font-extrabold text-[18px] tracking-tight" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[12px] font-medium" style={{ color: method === m.id ? "#0071e3" : "#6e6e73" }}>{m.sub}</span>
              </button>
            ))}
          </div>
        </PremiumCard>

        {/* Submit */}
        <button 
          disabled={!allChecked || isSaving}
          onClick={handleAcceptTerms}
          className={cn(
            "w-full h-14 rounded-full font-bold text-[16px] transition-all flex items-center justify-center gap-2",
            allChecked && !isSaving 
              ? "bg-[#0071e3] text-white shadow-[0_8px_20px_rgba(0,113,227,0.3)] hover:bg-[#0066cc] active:scale-[0.98]" 
              : "bg-[#e5e5e7] text-[#aeaeb2] cursor-not-allowed"
          )}>
          {isSaving ? "Guardando..." : (allChecked ? "Aceptar Términos y Continuar" : "Aceptá las condiciones para continuar")}
        </button>
        {saveStatus === 'success' && (
          <p className="text-center text-[#0071e3] text-[13px] mt-4 font-semibold">Condiciones aceptadas. Listo para procesar el pago oficial.</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-center text-[#ff3b30] text-[13px] mt-4 font-semibold bg-[#fceced] py-2 rounded-full">Hubo un error al guardar. Intentá de nuevo.</p>
        )}
        <p className="text-center text-[#aeaeb2] text-[12px] font-medium mt-6">Próximamente: Integración con Mercado Pago y PayPal</p>
      </div>
    </div>
  );
}
