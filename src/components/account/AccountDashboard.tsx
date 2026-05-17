import React from "react";
import Link from "next/link";
import { getAccountDashboard } from "@/lib/worldcup/account";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUser } from "@/lib/auth/getUser";
import { LogoutButton } from "@/components/auth/LogoutButton";

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
          <Link href="/login" className="bg-[#0071e3] text-white font-semibold text-[15px] px-8 py-3 rounded-full hover:bg-[#0066cc] transition-colors active:scale-95 shadow-sm">
            Iniciar sesión
          </Link>
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
          <Link href="/mi-prediccion" className="bg-[#0071e3] text-white font-semibold text-[15px] px-8 py-3 rounded-full hover:bg-[#0066cc] transition-colors active:scale-95 shadow-sm">
            Crear mi predicción
          </Link>
        </div>
      </div>
    );
  }

  const STATS = [
    { label: "Puntos totales", value: ranking?.total_points?.toLocaleString() || "0", icon: "stars", color: "#0071e3", bg: "#e8f0fd" },
    { label: "Posición global", value: ranking?.rank ? `#${ranking.rank}` : "-", icon: "leaderboard", color: "#0071e3", bg: "#e8f0fd" },
    { label: "Partidos completados", value: session.completed_matches || "0/104", icon: "check_circle", color: "#34a853", bg: "#e8f4e8" },
    { label: "Progreso", value: `${session.progress_percent || 0}%`, icon: "data_usage", color: "#0071e3", bg: "#e8f0fd" },
  ];

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile & Stats */}
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="w-16 h-16 rounded-full border border-[#e5e5e7] overflow-hidden shrink-0 bg-[#e8f0fd]">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full text-[#0071e3] flex items-center justify-center font-bold text-xl uppercase">
                  {user.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-[#1d1d1f] text-lg truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
              </h1>
              <p className="text-[#6e6e73] text-[13px] truncate">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-[#e8f4e8] text-[#34a853] text-[10px] font-bold uppercase tracking-wide rounded-full">
                <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                {session.status === 'active' ? 'Activo' : 'En curso'}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: stat.bg }}>
                  <span className="material-symbols-outlined text-base" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <span className="text-[10px] text-[#aeaeb2] uppercase tracking-wider font-semibold block">{stat.label}</span>
                <span className="font-display font-bold text-[#1d1d1f] text-lg">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Prediction Status & Navigation */}
        <div className="md:col-span-2 space-y-6">
          {/* Prediction status */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-[#1d1d1f] text-base">Mi predicción</h2>
              <Link href="/mi-prediccion" className="text-[#0071e3] text-[13px] font-semibold hover:underline">Editar</Link>
            </div>
            <div className="space-y-3">
              {["Fase de grupos", "Octavos", "Cuartos", "Semis", "Final"].map((phase, i) => (
                <div key={phase} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: i === 0 ? "#e8f4e8" : "#f0f0f2" }}>
                    <span className="material-symbols-outlined text-[11px]" style={{ color: i === 0 ? "#34a853" : "#aeaeb2", fontVariationSettings: "'FILL' 1" }}>
                      {i === 0 ? "check" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <span className="text-[14px] text-[#1d1d1f]">{phase}</span>
                  {i === 0 && <span className="ml-auto text-[11px] text-[#34a853] font-semibold">En progreso</span>}
                  {i > 0 && <span className="ml-auto text-[11px] text-[#aeaeb2]">Pendiente</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            {MENU_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-4 hover:bg-[#f5f5f7] transition-colors"
                style={{ borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#6e6e73] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[#1d1d1f] text-[14px] font-medium">{item.label}</span>
                  <p className="text-[#aeaeb2] text-[12px]">{item.desc}</p>
                </div>
                <span className="material-symbols-outlined text-[#d1d1d6] text-lg">chevron_right</span>
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <div className="flex justify-end">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
}
