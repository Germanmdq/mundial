"use client";

import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { createClient } from "@/lib/supabase/client";

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="bg-white rounded-3xl border border-[#e5e5e7] shadow-sm p-6 sm:p-8">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-[#e8f0fd] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[#0071e3] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {activeTab === "login" ? "login" : "person_add"}
            </span>
          </div>
          <h2 className="font-display font-bold text-[#1d1d1f] text-2xl mb-1">
            Sumate al Mundial
          </h2>
          <p className="text-[#6e6e73] text-[14px]">
            Competí por premios y demostrá cuánto sabés.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-12 flex items-center justify-center gap-3 bg-[#1d1d1f] text-white font-semibold text-[15px] rounded-full hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 mb-6"
        >
          {isGoogleLoading ? (
            "Conectando..."
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#e5e5e7]"></div>
          <span className="text-[12px] font-semibold text-[#aeaeb2] uppercase tracking-wider">o usá tu email</span>
          <div className="flex-1 h-px bg-[#e5e5e7]"></div>
        </div>

        <div className="flex bg-[#f5f5f7] rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === "login" 
                ? "bg-white text-[#1d1d1f] shadow-sm" 
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === "register" 
                ? "bg-white text-[#1d1d1f] shadow-sm" 
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            Crear Cuenta
          </button>
        </div>


        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
