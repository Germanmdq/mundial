"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Premios", href: "/premios" },
  { label: "Equipos", href: "/equipos" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Ranking", href: "/ranking" },
  { label: "Reglas", href: "/reglas" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const path = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#e5e5e7]">
        <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-[18px] text-[#0071e3]" style={{ fontVariationSettings:"'FILL' 1" }}>sports_soccer</span>
            <span className="font-display font-bold text-[15px] text-[#1d1d1f] tracking-tight">Mi Predicción</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                className={cn("text-[13px] font-medium transition-colors", path === n.href ? "text-[#0071e3]" : "text-[#6e6e73] hover:text-[#1d1d1f]")}>
                {n.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/cuenta" className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
                  <div className="w-6 h-6 bg-[#e8f0fd] text-[#0071e3] flex items-center justify-center rounded-full font-bold text-[10px] uppercase">
                    {user.email?.charAt(0) || 'U'}
                  </div>
                  Mi Cuenta
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Iniciar sesión</Link>
                <Link href="/mi-prediccion" className="bg-[#0071e3] text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-[#0066cc] transition-colors active:scale-95">
                  Crear mi predicción
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-[#1d1d1f]" onClick={() => setOpen(!open)} aria-label="Menú">
            <span className="material-symbols-outlined text-[20px]">{open ? "close" : "menu"}</span>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#e5e5e7] bg-white px-6 py-4 space-y-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className={cn("block py-2.5 text-[15px] font-medium", path === n.href ? "text-[#0071e3]" : "text-[#1d1d1f]")}>
                {n.label}
              </Link>
            ))}
            
            <div className="pt-3 border-t border-[#e5e5e7] mt-2 space-y-3">
              {user ? (
                <Link href="/cuenta" onClick={() => setOpen(false)}
                  className="block py-2.5 text-[15px] font-medium text-[#1d1d1f]">
                  Mi Cuenta ({user.email})
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="block py-2.5 text-[15px] font-medium text-[#1d1d1f]">
                    Iniciar sesión
                  </Link>
                  <Link href="/mi-prediccion" onClick={() => setOpen(false)}
                    className="block w-full text-center bg-[#0071e3] text-white font-semibold py-3 rounded-2xl text-[15px] active:scale-95 transition-all">
                    Crear mi predicción gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
