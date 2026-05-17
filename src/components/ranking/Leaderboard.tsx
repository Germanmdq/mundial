import React from "react";
import { cn } from "@/lib/utils";
import { getLeaderboard, getUserRanking } from "@/lib/worldcup/ranking";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUser } from "@/lib/auth/getUser";
import Link from "next/link";

const changeIcon: Record<string, { icon: string; color: string }> = {
  up:   { icon: "arrow_upward",   color: "#34a853" },
  down: { icon: "arrow_downward", color: "#ff3b30" },
  same: { icon: "remove",         color: "#aeaeb2" },
};

export async function Leaderboard({ type = 'global' }: { type?: 'global' | 'group' }) {
  const user = await getUser();
  const leaderboardData = await getLeaderboard(type);
  let userRanking = null;

  if (user) {
    userRanking = await getUserRanking(user.id);
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="py-12">
        <EmptyState 
          icon="leaderboard" 
          title="Ranking en actualización" 
          description="Cuando empiece la competencia vas a ver acá las posiciones oficiales." 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* My position card */}
      {!user ? (
        <div className="bg-white rounded-2xl p-6 border border-[#e5e5e7] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <h4 className="text-[#1d1d1f] font-bold text-[15px]">Tu posición</h4>
            <p className="text-[#6e6e73] text-[13px]">Iniciá sesión para ver tu posición.</p>
          </div>
          <Link href="/login" className="bg-[#0071e3] text-white text-[13px] font-semibold px-6 py-2.5 rounded-full hover:bg-[#0066cc] transition-colors whitespace-nowrap active:scale-95">
            Iniciar sesión
          </Link>
        </div>
      ) : userRanking ? (
        <div className="bg-[#e8f0fd] rounded-2xl p-4 border border-[#c8dcfa] flex items-center gap-4">
          <span className="w-7 text-center font-bold text-[15px] text-[#0071e3]">{userRanking.rank}</span>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0071e3]/30 shrink-0">
            {userRanking.avatar_url ? (
              <img src={userRanking.avatar_url} alt="Tu perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0071e3] flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#1d1d1f] font-semibold text-[14px]">Tu posición</h4>
            <p className="text-[#6e6e73] text-[12px]">{(userRanking.total_points || 0).toLocaleString()} puntos</p>
          </div>
          <span className="text-[#0071e3] font-bold text-[13px] shrink-0">Tu lugar</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-[#e5e5e7] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <h4 className="text-[#1d1d1f] font-bold text-[15px]">Tu posición</h4>
            <p className="text-[#6e6e73] text-[13px]">No tenés puntos registrados aún.</p>
          </div>
          <Link href="/mi-prediccion" className="text-[#0071e3] text-[13px] font-semibold hover:underline">
            Cargar predicción
          </Link>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e5e5e7] shadow-sm overflow-hidden">
        {leaderboardData.map((u, i) => {
          const trend = u.trend || 'same';
          const ch = changeIcon[trend] || changeIcon.same;
          return (
            <div key={u.id || i}
              className={cn("flex items-center gap-4 px-5 py-3.5 hover:bg-[#f5f5f7] transition-colors",
                i < leaderboardData.length - 1 ? "border-b border-[#f0f0f2]" : "",
                user && user.id === u.user_id ? "bg-[#f5f8ff] hover:bg-[#edf3ff]" : "")}>
              <span className={cn("w-6 text-center font-bold text-[14px] shrink-0",
                u.rank <= 3 ? "text-[#0071e3]" : "text-[#aeaeb2]")}>
                {u.rank}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#e5e5e7]">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.display_name || "Usuario"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f0f0f2] flex items-center justify-center text-[#6e6e73] text-xs font-bold uppercase">
                    {(u.display_name || 'U').charAt(0)}
                  </div>
                )}
              </div>
              <span className="flex-1 text-[14px] font-medium text-[#1d1d1f] truncate">{u.display_name || 'Participante'}</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]" style={{ color: ch.color }}>{ch.icon}</span>
              </div>
              <span className="font-semibold text-[14px] text-[#1d1d1f] tabular-nums">{(u.total_points || 0).toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
