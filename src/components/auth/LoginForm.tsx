"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
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
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      setError(authError.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Si creaste tu cuenta con Google, usá el botón de arriba.' 
        : 'Hubo un problema al iniciar sesión. Intentá de nuevo.');
      setLoading(false);
      return;
    }
    
    router.refresh();
    router.push("/cuenta");
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-[#0071e3] text-white h-[50px] rounded-full font-semibold active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 shadow-sm"
      >
        {loading ? "Iniciando..." : "Iniciar Sesión"}
      </button>


    </form>
  );
}
