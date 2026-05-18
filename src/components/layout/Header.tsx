"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-[100] h-[56px] bg-white/90 backdrop-blur-xl border-b border-black/5">
      <nav 
        className="max-w-[1100px] h-[56px] mx-auto px-6 grid items-center box-border"
        style={{ gridTemplateColumns: "auto 1fr auto", columnGap: "34px" }}
        aria-label="Menú principal"
      >
        <Link href="/" className="text-[#1d1d1f] text-[14px] font-bold leading-none whitespace-nowrap">
          Mundial entre Amigos
        </Link>

        <div className="hidden md:flex justify-center items-center gap-[30px]">
          <Link href="/#como-funciona" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/#como-funciona" ? "text-black" : "text-black/75 hover:text-black")}>Cómo funciona</Link>
          <Link href="/equipos" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/equipos" ? "text-black" : "text-black/75 hover:text-black")}>Equipos</Link>
          <Link href="/ranking" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/ranking" ? "text-black" : "text-black/75 hover:text-black")}>Ranking</Link>
          <Link href="/premios" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/premios" ? "text-black" : "text-black/75 hover:text-black")}>Premios</Link>
          <Link href="/reglas" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/reglas" ? "text-black" : "text-black/75 hover:text-black")}>Reglas</Link>
        </div>

        <div className="hidden md:flex items-center gap-[14px]">
          {user ? (
            <Link href="/cuenta" className="text-[13px] font-medium text-black/75 hover:text-black whitespace-nowrap flex items-center gap-2">
              <div className="w-5 h-5 bg-[#e8f0fd] text-[#0071e3] flex items-center justify-center rounded-full font-bold text-[9px] uppercase">
                {user.email?.charAt(0) || 'U'}
              </div>
              Cuenta
            </Link>
          ) : (
            <Link href="/login" className="text-[13px] font-medium text-black/75 hover:text-black whitespace-nowrap">Ingresar</Link>
          )}
          <Link 
            href="/mi-prediccion" 
            className="h-[34px] px-[18px] inline-flex items-center justify-center rounded-full bg-[#0071e3] text-white text-[13px] font-semibold whitespace-nowrap shadow-[0_4px_12px_rgba(0,113,227,0.22)] hover:bg-[#0066cc] transition-colors"
          >
            Crear mi predicción
          </Link>
        </div>

        <button
          className="md:hidden flex flex-col justify-center items-center w-6 h-6 gap-[5px] relative"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className={cn("block w-4 h-[1px] bg-black transition-transform duration-300", menuOpen && "absolute rotate-45")}></span>
          <span className={cn("block w-4 h-[1px] bg-black transition-opacity duration-300", menuOpen && "opacity-0")}></span>
          <span className={cn("block w-4 h-[1px] bg-black transition-transform duration-300 absolute", menuOpen ? "-rotate-45" : "mt-[12px]")}></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "md:hidden fixed inset-x-0 bottom-0 bg-white z-[90] flex flex-col px-[40px] pt-[20px] pb-[40px] gap-[18px] overflow-y-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          menuOpen ? "top-[56px] opacity-100 pointer-events-auto translate-y-0" : "top-[56px] opacity-0 pointer-events-none -translate-y-4"
        )}
      >
        <Link href="/" className="text-[#1d1d1f] text-[24px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link href="/#como-funciona" className="text-[#1d1d1f] text-[24px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Cómo funciona</Link>
        <Link href="/equipos" className="text-[#1d1d1f] text-[24px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Equipos</Link>
        <Link href="/ranking" className="text-[#1d1d1f] text-[24px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Ranking</Link>
        <Link href="/premios" className="text-[#1d1d1f] text-[24px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Premios</Link>
        <Link href="/reglas" className="text-[#1d1d1f] text-[24px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Reglas</Link>
        
        <div className="mt-4 pt-4 border-t border-black/10 flex flex-col gap-4">
          {user ? (
            <Link href="/cuenta" className="text-[#1d1d1f] text-[20px] font-bold leading-none tracking-[-0.015em] flex items-center gap-3" onClick={() => setMenuOpen(false)}>
              <div className="w-8 h-8 bg-[#e8f0fd] text-[#0071e3] flex items-center justify-center rounded-full font-bold text-[14px] uppercase">
                {user.email?.charAt(0) || 'U'}
              </div>
              Mi Cuenta
            </Link>
          ) : (
            <Link href="/login" className="text-[#1d1d1f] text-[20px] font-bold leading-none tracking-[-0.015em]" onClick={() => setMenuOpen(false)}>Ingresar</Link>
          )}
          <Link 
            href="/mi-prediccion" 
            className="mt-2 h-[44px] w-fit px-[18px] inline-flex items-center justify-center rounded-full bg-[#0071e3] text-white text-[15px] font-bold tracking-tight" 
            onClick={() => setMenuOpen(false)}
          >
            Crear mi predicción
          </Link>
        </div>
      </div>
    </header>
  );
}
