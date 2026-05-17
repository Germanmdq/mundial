"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Inicio", icon: "home", href: "/" },
  { label: "Premios", icon: "emoji_events", href: "/premios" },
  { label: "Jugar", icon: "sports_soccer", href: "/mi-prediccion" },
  { label: "Ranking", icon: "leaderboard", href: "/ranking" },
  { label: "Cuenta", icon: "person", href: "/cuenta" },
];

export function MobileNav() {
  const path = usePathname();
  return (
    <div className="fixed bottom-0 w-full z-50 md:hidden">
      {path === "/" && (
        <div className="px-4 pt-3 pb-1 bg-[#f5f5f7]/90 backdrop-blur-md">
          <Link href="/mi-prediccion"
            className="w-full h-12 bg-[#0071e3] text-white font-semibold text-[15px] rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
            Crear mi predicción gratis
          </Link>
          <p className="text-center text-[11px] text-[#aeaeb2] mt-1.5">Podés activar la participación por premios al finalizar.</p>
        </div>
      )}
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#e5e5e7]">
        <div className="flex justify-around items-center pt-2 pb-5 px-2">
          {ITEMS.map((item) => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn("flex flex-col items-center py-1 px-3 rounded-xl min-w-[52px] transition-colors", active ? "text-[#0071e3]" : "text-[#aeaeb2]")}>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{item.icon}</span>
                <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
