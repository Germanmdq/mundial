import { AppShell } from "@/components/layout/AppShell";
import { getPrizePacks } from "@/lib/worldcup/prizes";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function PremiosPage() {
  const prizes = await getPrizePacks();

  return (
    <AppShell>
      <div className="bg-[#f5f5f7] min-h-screen py-16">
        <div className="max-w-[1180px] mx-auto px-6 space-y-8">
          <div className="space-y-2 text-center mb-12">
            <span className="text-[#6e6e73] text-[11px] font-semibold uppercase tracking-[0.18em] block mb-2">Recompensas</span>
            <h1 className="font-display font-extrabold text-[#1d1d1f] text-4xl tracking-tight">Nuestros Premios</h1>
            <p className="text-[#6e6e73] text-[16px] max-w-lg mx-auto">Competí por los mejores productos tecnológicos y experiencias.</p>
          </div>
          
          {!prizes || prizes.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                icon="redeem" 
                title="Premios en actualización" 
                description="Estamos preparando los premios oficiales. Vuelve pronto para conocerlos." 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prizes.map((prize, idx) => {
                const bgGradient = prize.slug === "pack-apple" 
                  ? "linear-gradient(135deg, #1e1e1f 0%, #3a3a3c 100%)"
                  : prize.slug === "pack-gamer-mundial"
                  ? "linear-gradient(135deg, #0d0e15 0%, #1f2035 100%)"
                  : prize.slug === "pack-living-mundial"
                  ? "linear-gradient(135deg, #0071e3 0%, #005bb5 100%)"
                  : prize.slug === "pack-creador"
                  ? "linear-gradient(135deg, #f56300 0%, #e05300 100%)"
                  : "linear-gradient(135deg, #34a853 0%, #2b8c44 100%)";

                const icon = prize.slug === "pack-apple" 
                  ? "devices" 
                  : prize.slug === "pack-gamer-mundial"
                  ? "sports_esports"
                  : prize.slug === "pack-living-mundial"
                  ? "tv"
                  : prize.slug === "pack-creador"
                  ? "photo_camera"
                  : "shopping_bag";

                return (
                  <div key={prize.id || idx} className="bg-white rounded-3xl overflow-hidden border border-[#e5e5e7] shadow-sm flex flex-col group">
                    <div className="relative h-64 shrink-0 flex items-center justify-center overflow-hidden" style={{ background: bgGradient }}>
                      {prize.image_url ? (
                        <img
                          src={prize.image_url}
                          alt={prize.image_alt || prize.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                          <span className="material-symbols-outlined text-[64px] opacity-90 group-hover:scale-110 transition-transform duration-500 ease-out" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                            {icon}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Visual Placeholder</span>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)" }} />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/95 text-[#1d1d1f] text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full shadow-sm">
                          {prize.subtitle || "Tech Pack"}
                        </span>
                      </div>
                    </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <p className="text-[10px] text-[#aeaeb2] uppercase tracking-widest mb-1">{prize.disclaimer || 'Imagen referencial'}</p>
                    <h3 className="text-[#1d1d1f] font-bold text-2xl mb-2">{prize.title}</h3>
                    <p className="text-[#6e6e73] text-[15px]">{prize.description}</p>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          <div className="bg-[#e8f0fd] border border-[#c8dcfa] rounded-2xl p-8 mt-16 max-w-3xl mx-auto text-center">
            <h3 className="text-[#1d1d1f] font-bold text-[18px] mb-3">¿Cómo ganar?</h3>
            <p className="text-[#6e6e73] text-[15px]">
              Los premios se entregan según el ranking de cada fase y el ranking global final. 
              Mantené tus predicciones actualizadas para no perder puntos.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
