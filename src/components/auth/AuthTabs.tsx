"use client";

import React, { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { createClient } from "@/lib/supabase/client";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { cn } from "@/lib/utils";
import { getAuthCallbackUrl } from "@/lib/auth/redirect-url";

type AuthTabsProps = {
  mode?: "login" | "signup";
  redirectTo?: string;
};

export function AuthTabs({ mode = "login", redirectTo = "/mi-prediccion" }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(mode === "signup" ? "register" : "login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [authDebug, setAuthDebug] = useState<{
    origin: string;
    redirectTo: string;
    callbackUrl: string;
    appUrl: string;
    userAgent: string;
  } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.search.includes("debugAuth=1")) return;

    const timer = window.setTimeout(() => {
      setAuthDebug({
        origin: window.location.origin,
        redirectTo,
        callbackUrl: getAuthCallbackUrl(redirectTo),
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
        userAgent: window.navigator.userAgent,
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [redirectTo]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    const callbackUrl = getAuthCallbackUrl(redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          prompt: "select_account",
        },
      }
    });

    if (error) {
      console.error("[auth:google:error]", {
        message: error.message,
        redirectTo: callbackUrl,
        origin: typeof window !== "undefined" ? window.location.origin : null,
      });
      setGoogleError("No pudimos iniciar sesión con Google. Probá nuevamente o usá email.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <PremiumCard className="p-8 md:p-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-[#e8f0fd] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <span className="material-symbols-outlined text-[#0071e3] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {activeTab === "login" ? "login" : "person_add"}
            </span>
          </div>
          <h2 className="font-display font-extrabold text-[#1d1d1f] text-3xl tracking-tight mb-2">
            Sumate al juego.
          </h2>
          <p className="text-[#6e6e73] text-[15px] font-medium leading-relaxed">
            Armá tu predicción y competí.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white text-[#1d1d1f] font-semibold text-[15px] rounded-full border border-[rgba(0,0,0,0.08)] shadow-sm hover:bg-[#f5f5f7] transition-all active:scale-[0.98] disabled:opacity-70 mb-6"
        >
          {isGoogleLoading ? (
            "Conectando..."
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </>
          )}
        </button>
        {googleError && (
          <p className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold leading-relaxed text-red-700">
            {googleError}
          </p>
        )}

        {authDebug && (
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-[11px] leading-relaxed text-blue-900">
            <div><strong>origin:</strong> {authDebug.origin}</div>
            <div><strong>redirectTo:</strong> {authDebug.redirectTo}</div>
            <div className="break-all"><strong>callbackUrl:</strong> {authDebug.callbackUrl}</div>
            <div className="break-all"><strong>NEXT_PUBLIC_APP_URL:</strong> {authDebug.appUrl || "(vacío)"}</div>
            <div className="break-all"><strong>userAgent:</strong> {authDebug.userAgent}</div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-[#e5e5e7]"></div>
          <span className="text-[11px] font-bold text-[#aeaeb2] uppercase tracking-[0.1em]">O con email</span>
          <div className="flex-1 h-[1px] bg-[#e5e5e7]"></div>
        </div>

        <div className="flex bg-[#f5f5f7] rounded-[14px] p-1 mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all",
              activeTab === "login" 
                ? "bg-white text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.06)]" 
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            )}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all",
              activeTab === "register" 
                ? "bg-white text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.06)]" 
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            )}
          >
            Crear Cuenta
          </button>
        </div>


        {activeTab === "login" ? <LoginForm redirectTo={redirectTo} /> : <RegisterForm redirectTo={redirectTo} />}
      </PremiumCard>
    </div>
  );
}
