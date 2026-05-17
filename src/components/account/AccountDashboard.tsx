import React from "react";
import Link from "next/link";
import { getAccountDashboard } from "@/lib/worldcup/account";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUser } from "@/lib/auth/getUser";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const MENU_ITEMS = [
  { icon: "sports_soccer", label: "Mi predicción", href: "/mi-prediccion", desc: "Ver y editar mis pronósticos" },
  { icon: "emoji_events", label: "Premios", href: "/premios", desc: "Premios disponibles por fase" },
  { icon: "leaderboard", label: "Ranking", href: "/ranking", desc: "Mi posición en el ranking global" },
  { icon: "star", label: "Partidos Dorados", href: "/partidos-dorados", desc: "Partidos con puntos dobles" },
];

export async function AccountDashboard() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <EmptyState 
          icon="account_circle" 
          title="Iniciá sesión" 
          description="Iniciá sesión para guardar tus predicciones, ver tu ranking y participar por premios."
        />
        <div className="flex justify-center mt-6">
          <PremiumButton href="/login">Iniciar sesión</PremiumButton>
        </div>
      </div>
    );
  }

  const { session, ranking } = await getAccountDashboard(user.id);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <EmptyState 
          icon="edit_note" 
          title="Todavía no empezaste tu predicción." 
          description="Armá tu fixture y participá de la competencia."
        />
        <div className="flex justify-center mt-6">
          <PremiumButton href="/mi-prediccion">Crear mi predicción</PremiumButton>
        </div>
      </div>
    );
  }

  const STATS = [
    { label: "Puntos totales", value: ranking?.total_points?.toLocaleString() || "0", icon: "stars", color: "#0071e3", bg: "#e8f0fd" },
    { label: "Posición global", value: ranking?.rank ? `#${ranking.rank}` : "-", icon: "leaderboard", color: "#0071e3", bg: "#e8f0fd" },
    { label: "Partidos", value: session.completed_matches || "0/104", icon: "sports_soccer", color: "#0071e3", bg: "#e8f0fd" },
    { label: "Progreso", value: `${session.progress_percent || 0}%`, icon: "data_usage", color: "#0071e3", bg: "#e8f0fd" },
  ];

  return (
    <div className="max-w-[1040px] mx-auto px-5 md:px-6 py-10 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Profile & Stats */}
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <PremiumCard className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-[rgba(0,0,0,0.06)] overflow-hidden shrink-0 bg-[#e8f0fd]">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full text-[#0071e3] flex items-center justify-center font-bold text-xl uppercase">
                  {user.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[#1d1d1f] text-lg truncate tracking-tight">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
              </h1>
              <p className="text-[#6e6e73] text-[13px] truncate mb-2">{user.email}</p>
              <StatusBadge variant="blue" icon="verified">
                {session.status === 'active' ? 'Activo' : 'En curso'}
              </StatusBadge>
            </div>
          </PremiumCard>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => (
              <PremiumCard key={stat.label} className="!p-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <span className="text-[10px] text-[#aeaeb2] uppercase tracking-[0.15em] font-bold block mb-1">{stat.label}</span>
                <span className="font-display font-bold text-[#1d1d1f] text-xl tracking-tight">{stat.value}</span>
              </PremiumCard>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Prediction Status & Navigation */}
        <div className="md:col-span-2 space-y-6">
          {/* Prediction status */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(0,0,0,0.06)]">
              <h2 className="font-display font-extrabold text-[#1d1d1f] text-xl tracking-tight">Mi predicción</h2>
              <Link href="/mi-prediccion" className="text-[#0071e3] text-[13px] font-semibold hover:underline bg-[#e8f0fd] px-3 py-1.5 rounded-full">Editar</Link>
            </div>
            <div className="space-y-4">
              {["Fase de grupos", "Octavos", "Cuartos", "Semis", "Final"].map((phase, i) => (
                <div key={phase} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: i === 0 ? "#e8f0fd" : "#f5f5f7" }}>
                    <span className="material-symbols-outlined text-[11px]" style={{ color: i === 0 ? "#0071e3" : "#aeaeb2", fontVariationSettings: "'FILL' 1" }}>
                      {i === 0 ? "check" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1d1d1f]">{phase}</span>
                  {i === 0 && <span className="ml-auto text-[11px] text-[#0071e3] font-bold uppercase tracking-[0.1em]">En progreso</span>}
                  {i > 0 && <span className="ml-auto text-[11px] text-[#aeaeb2] font-bold uppercase tracking-[0.1em]">Pendiente</span>}
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Menu items */}
          <PremiumCard noPadding className="overflow-hidden">
            {MENU_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-6 py-5 hover:bg-[#fbfbfd] transition-colors"
                style={{ borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] flex items-center justify-center shrink-0 border border-[rgba(0,0,0,0.03)]">
                  <span className="material-symbols-outlined text-[#1d1d1f] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[#1d1d1f] text-[15px] font-bold tracking-tight">{item.label}</span>
                  <p className="text-[#6e6e73] text-[13px]">{item.desc}</p>
                </div>
                <span className="material-symbols-outlined text-[#d1d1d6] text-xl">chevron_right</span>
              </Link>
            ))}
          </PremiumCard>

          {/* Sign out */}
          <div className="flex justify-end pt-2">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
}
