"use client";
import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";

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
            <Link href="/login" className="bg-[#0071e3] text-white font-semibold text-[15px] px-8 py-3 rounded-full hover:bg-[#0066cc] transition-colors active:scale-95 shadow-sm">
              Iniciar sesión
            </Link>
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
      <div className="max-w-[620px] mx-auto px-6">
        <Link href="/mi-prediccion" className="inline-flex items-center gap-1 text-[#0071e3] text-[13px] font-medium mb-8 hover:underline">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#e8f0fd] rounded-3xl flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-[#0071e3] text-[22px]" style={{ fontVariationSettings:"'FILL' 1" }}>emoji_events</span>
          </div>
          <h1 className="font-display font-bold text-[#1d1d1f] text-[28px] tracking-tight mb-2">Activá tu participación</h1>
          <p className="text-[#6e6e73] text-[15px] max-w-sm mx-auto">
            Tu predicción ya está lista. Ahora podés entrar al ranking oficial y competir por premios.
          </p>
        </div>

        {/* Product card */}
        <div className="bg-white rounded-3xl border border-[#e5e5e7] shadow-sm overflow-hidden mb-4">
          <div className="px-6 pt-6 pb-5 border-b border-[#f0f0f2]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-[0.18em] block mb-1">Participación oficial</span>
                <h2 className="font-display font-bold text-[#1d1d1f] text-[18px]">Mi Predicción Mundial 2026</h2>
                <p className="text-[#6e6e73] text-[13px] mt-0.5">Entrada única · Acceso completo</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display font-bold text-[#1d1d1f] text-[24px]">$5.000</span>
                <span className="text-[#6e6e73] text-[13px] block">ARS</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-wider mb-3">Incluye</p>
            <ul className="space-y-2">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#34a853] text-[16px]" style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>
                  <span className="text-[#1d1d1f] text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="bg-white rounded-2xl border border-[#e5e5e7] px-6 py-5 mb-4 space-y-3">
          {[
            { k:"rules"   as const, text:"Acepto las", link:"/reglas", lt:"Reglas y Condiciones" },
            { k:"prizes"  as const, text:"Acepto las condiciones de premios", link:"/reglas", lt:"Ver detalle" },
            { k:"privacy" as const, text:"Acepto la política de privacidad", link:"/reglas", lt:"Ver detalle" },
          ].map((item) => (
            <label key={item.k} className="flex items-start gap-3 cursor-pointer">
              <div onClick={() => toggle(item.k)}
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                style={{ borderColor: checks[item.k] ? "#0071e3" : "#d1d1d6", background: checks[item.k] ? "#0071e3" : "white" }}>
                {checks[item.k] && <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings:"'FILL' 1" }}>check</span>}
              </div>
              <span className="text-[13px] text-[#1d1d1f]">
                {item.text} <Link href={item.link} className="text-[#0071e3] hover:underline">{item.lt}</Link>
              </span>
            </label>
          ))}
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-2xl border border-[#e5e5e7] px-6 py-5 mb-4">
          <p className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-wider mb-4">Método de pago</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id:"mp" as const, label:"Mercado Pago", sub:"Tarjeta / Efectivo",  color:"#009ee3" },
              { id:"pp" as const, label:"PayPal",        sub:"Internacional",       color:"#003087" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className="flex flex-col items-center justify-center gap-1 border-2 rounded-2xl py-5 transition-all"
                style={{ borderColor: method === m.id ? "#0071e3" : "#e5e5e7", background: method === m.id ? "#e8f0fd" : "white" }}>
                <span className="font-display font-bold text-[18px]" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[11px] text-[#aeaeb2]">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button 
          disabled={!allChecked || isSaving}
          onClick={handleAcceptTerms}
          className="w-full h-12 rounded-full font-semibold text-[16px] transition-all flex items-center justify-center gap-2"
          style={{ background: allChecked ? "#0071e3" : "#e5e5e7", color: allChecked ? "white" : "#aeaeb2", cursor: allChecked && !isSaving ? "pointer" : "not-allowed" }}>
          {isSaving ? "Guardando..." : (allChecked ? "Aceptar Términos y Continuar" : "Aceptá las condiciones para continuar")}
        </button>
        {saveStatus === 'success' && (
          <p className="text-center text-[#34a853] text-[13px] mt-4 font-medium">Condiciones aceptadas. Listo para procesar el pago oficial.</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-center text-[#ff3b30] text-[13px] mt-4 font-medium">Hubo un error al guardar. Intentá de nuevo.</p>
        )}
        <p className="text-center text-[#aeaeb2] text-[12px] mt-4">Próximamente: Integración con Mercado Pago y PayPal</p>
      </div>
    </div>
  );
}
