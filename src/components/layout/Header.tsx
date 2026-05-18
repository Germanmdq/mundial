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
  const [authReady, setAuthReady] = useState(false);
  const path = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthReady(true);
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-[100] h-[56px] bg-white/90 backdrop-blur-xl border-b border-black/5">
      <nav 
        className="max-w-[1100px] h-[56px] mx-auto px-4 md:px-6 flex items-center justify-between md:grid box-border"
        style={{ gridTemplateColumns: "auto 1fr auto", columnGap: "34px" }}
        aria-label="Menú principal"
      >
        <Link href="/" className="text-[#1d1d1f] text-[14px] font-bold leading-none whitespace-nowrap">
          Mundial entre Amigos
        </Link>

        <div className="hidden md:flex justify-center items-center gap-[30px]">
          <Link href="/" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/" ? "text-black" : "text-black/75 hover:text-black")}>Inicio</Link>
          <Link href="/equipos" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/equipos" ? "text-black" : "text-black/75 hover:text-black")}>Equipos</Link>
          <Link href="/ranking" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/ranking" ? "text-black" : "text-black/75 hover:text-black")}>Ranking</Link>
          <Link href="/premios" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/premios" ? "text-black" : "text-black/75 hover:text-black")}>Premios</Link>
          <Link href="/reglas" className={cn("text-[13px] font-medium leading-none whitespace-nowrap transition-colors", path === "/reglas" ? "text-black" : "text-black/75 hover:text-black")}>Reglas</Link>
        </div>

        <div className="hidden md:flex items-center gap-[14px]">
          {!authReady ? (
            <span className="h-[34px] w-[72px] rounded-full bg-black/[0.04]" aria-hidden="true" />
          ) : user ? (
            <>
              <Link href="/cuenta" className="text-[13px] font-medium text-black/75 hover:text-black whitespace-nowrap flex items-center gap-2">
                <div className="w-5 h-5 bg-[#e8f0fd] text-[#0071e3] flex items-center justify-center rounded-full font-bold text-[9px] uppercase">
                  {user.email?.charAt(0) || 'U'}
                </div>
                Cuenta
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-[13px] font-medium text-black/55 hover:text-black whitespace-nowrap"
              >
                Cerrar sesión
              </button>
            </>
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
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-full hover:bg-black/[0.04] relative"
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
          "md:hidden fixed left-0 right-0 top-[56px] z-[90] bg-white border-b border-black/10 shadow-xl transition-all duration-200",
          menuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-2"
        )}
      >
        <div className="flex flex-col px-4 py-4 gap-1">
          <Link href="/" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/equipos" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Equipos</Link>
          <Link href="/ranking" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Ranking</Link>
          <Link href="/premios" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Premios</Link>
          <Link href="/reglas" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Reglas</Link>
          <Link href="/mi-prediccion" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Mi predicción</Link>
        
          <div className="mt-3 pt-4 border-t border-black/10 flex flex-col gap-3">
            {!authReady ? (
              <div className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#6e6e73]">
                Cargando sesión...
              </div>
            ) : user ? (
              <>
                <Link href="/cuenta" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04] flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                  <div className="w-8 h-8 bg-[#e8f0fd] text-[#0071e3] flex items-center justify-center rounded-full font-bold text-[14px] uppercase">
                    {user.email?.charAt(0) || 'U'}
                  </div>
                  Cuenta
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-red-600 hover:bg-black/[0.04]"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="w-full rounded-[14px] px-4 py-[14px] text-left text-[17px] font-bold text-[#1d1d1f] hover:bg-black/[0.04]" onClick={() => setMenuOpen(false)}>Ingresar</Link>
            )}
            <Link 
              href="/mi-prediccion" 
              className="mt-3 w-full h-12 rounded-full bg-[#0071e3] text-white text-[16px] font-bold flex items-center justify-center" 
              onClick={() => setMenuOpen(false)}
            >
              Crear mi predicción
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
