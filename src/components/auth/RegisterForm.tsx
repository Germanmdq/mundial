"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getAuthCallbackUrl } from "@/lib/auth/redirect-url";

type RegisterFormProps = {
  redirectTo?: string;
};

export function RegisterForm({ redirectTo = "/mi-prediccion" }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(redirectTo),
      },
    });
    
    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Ese email ya está registrado. Por favor iniciá sesión.'
        : 'Hubo un problema al crear tu cuenta. Intentá de nuevo.');
      setLoading(false);
      return;
    }
    
    // Supabase will automatically sign in if email confirmation is disabled.
    // If confirmation is required, it won't sign in immediately.
    // We assume auto-login for now or successful account creation.
    router.refresh();
    router.push(redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/mi-prediccion");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-[#fff0f0] border border-[#ffd6d6] text-[#ff3b30] text-[13px] rounded-xl text-center">
          {error}
        </div>
      )}
      
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider px-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full bg-[#f5f5f7] border border-[#e5e5e7] rounded-xl px-4 py-3.5 text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] transition-colors shadow-sm"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider px-1">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-[#f5f5f7] border border-[#e5e5e7] rounded-xl px-4 py-3.5 text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] transition-colors shadow-sm"
          required
        />
        <p className="text-[11px] text-[#aeaeb2] px-1 pt-0.5">Mínimo 6 caracteres</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-[#0071e3] text-white h-[50px] rounded-full font-semibold active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 shadow-sm"
      >
        {loading ? "Creando..." : "Crear cuenta"}
      </button>


    </form>
  );
}
