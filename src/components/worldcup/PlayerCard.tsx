import type { Player } from '@/lib/worldcup/players'
import { getInitials, getPlayerPhotoSources } from '@/lib/worldcup/assets'
import { SafeAssetImage } from '@/components/worldcup/SafeAssetImage'

type PlayerCardProps = {
  player: Player
  teamSlug?: string | null
}

function PhotoFallback({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f5f5f7] text-[13px] font-black text-[#6e6e73]">
      {getInitials(name)}
    </div>
  )
}

export function PlayerCard({ player, teamSlug }: PlayerCardProps) {
  const photoSources = getPlayerPhotoSources(player, teamSlug)
  
  // Custom display position text
  let positionText = player.position || "Sin posición confirmada";
  const posUpper = (player.position || "").trim().toUpperCase();
  if (posUpper === "GK") positionText = "Arquero";
  else if (posUpper === "DF") positionText = "Defensor";
  else if (posUpper === "MF") positionText = "Mediocampista";
  else if (posUpper === "FW") positionText = "Delantero";

  const metaText = [positionText, player.club].filter(Boolean).join(" · ");

  return (
    <div className="playerRow">
      <div className="playerAvatar shrink-0 overflow-hidden">
        <SafeAssetImage
          src={photoSources}
          alt={`Foto de ${player.name}`}
          className="h-full w-full object-cover"
          fallback={<PhotoFallback name={player.name} />}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="playerName truncate">{player.name}</h4>
        <p className="playerMeta truncate">{metaText}</p>
      </div>
    </div>
  )
}
