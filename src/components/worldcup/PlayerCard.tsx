import type { Player } from '@/lib/worldcup/players'
import { getInitials, getPlayerPhotoSources } from '@/lib/worldcup/assets'
import { SafeAssetImage } from '@/components/worldcup/SafeAssetImage'

type PlayerCardProps = {
  player: Player
  teamSlug?: string | null
  teamName?: string | null
}

function PhotoFallback({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_20%,#ffffff_0,#e8eef7_42%,#b9c6d8_100%)] text-[15px] font-black tracking-[0.12em] text-[#1d1d1f]">
      {getInitials(name)}
    </div>
  )
}

export function PlayerCard({ player, teamSlug, teamName }: PlayerCardProps) {
  const photoSources = getPlayerPhotoSources(player, teamSlug)
  const isPending = player.status !== 'confirmed'

  return (
    <article className="flex gap-4 rounded-2xl border border-[#e5e5e7] bg-[#f9f9fb] p-4 transition hover:border-[#c7c7cc] hover:bg-white">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white bg-white shadow-sm">
        <SafeAssetImage
          src={photoSources}
          alt={`Foto de ${player.name}`}
          className="h-full w-full object-cover"
          fallback={<PhotoFallback name={player.name} />}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="truncate text-[15px] font-extrabold leading-tight text-[#1d1d1f]">{player.name}</h4>
          {player.shirt_number ? (
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-[#6e6e73] shadow-sm">
              #{player.shirt_number}
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[12px] font-semibold text-[#6e6e73]">{player.position || 'Posición por confirmar'}</p>
        {player.club ? <p className="mt-0.5 truncate text-[11px] text-[#86868b]">{player.club}</p> : null}
        {teamName ? <p className="mt-0.5 truncate text-[11px] text-[#aeaeb2]">{teamName}</p> : null}
        {isPending ? (
          <span className="mt-3 inline-flex rounded-full bg-[#fff3d6] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#a45f00]">
            En revisión
          </span>
        ) : null}
      </div>
    </article>
  )
}
