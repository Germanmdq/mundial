import Link from 'next/link'
import type { Team } from '@/lib/worldcup/teams'
import { getTeamAssetSources } from '@/lib/worldcup/assets'
import { SafeAssetImage } from '@/components/worldcup/SafeAssetImage'
import { getTeamDisplayName } from '@/lib/worldcup/team-display-names'

type TeamCardProps = {
  team: Team
}

function FlagFallback({ code }: { code: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white/85 text-[10px] font-black tracking-[0.18em] text-[#1d1d1f]">
      {code ?? 'FIFA'}
    </div>
  )
}

function CrestFallback({ code }: { code: string | null }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28%] border border-white/70 bg-gradient-to-br from-[#fefefe] via-[#e8eef7] to-[#cbd5e1] shadow-inner">
      <div className="absolute inset-x-3 top-2 h-1 rounded-full bg-[#1d1d1f]/10" />
      <span className="text-[13px] font-black tracking-[0.16em] text-[#1d1d1f]">{code ?? 'TM'}</span>
    </div>
  )
}

export function TeamCard({ team }: TeamCardProps) {
  const flagSources = [...getTeamAssetSources(team.team_assets, 'flag', team.slug), team.flag_url].filter((source): source is string => Boolean(source))
  const crestSources = [...getTeamAssetSources(team.team_assets, 'crest', team.slug), team.crest_url].filter((source): source is string => Boolean(source))
  const stageSources = [
    ...getTeamAssetSources(team.team_assets, 'hero_image', team.slug),
    ...getTeamAssetSources(team.team_assets, 'background', team.slug),
    team.hero_image_url,
  ].filter((source): source is string => Boolean(source))
  const code = team.fifa_code ?? (team.name ? team.name.slice(0, 3).toUpperCase() : null)
  const groupLabel = team.group_letter || team.group_name?.replace(/^Grupo\s+/i, '') || '-'

  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#e5e5e7] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative aspect-[1.35] overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#ffffff_0,#f2f6ff_32%,#dce5f2_66%,#c4cedd_100%)]">
        <SafeAssetImage
          src={stageSources}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
          fallback={null}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-white/15" />
        <div className="absolute left-4 top-4 h-10 w-10 overflow-hidden rounded-full border border-white/70 bg-white/70 shadow-sm backdrop-blur">
          <SafeAssetImage
            src={flagSources}
            alt={`Bandera de ${team.name}`}
            className="h-full w-full object-cover"
            fallback={<FlagFallback code={code} />}
          />
        </div>
        <div className="absolute bottom-4 left-1/2 h-20 w-20 -translate-x-1/2 rounded-[28%] bg-white/70 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur">
          <SafeAssetImage
            src={crestSources}
            alt={`Escudo de ${team.name}`}
            className="h-full w-full object-contain"
            fallback={<CrestFallback code={code} />}
          />
        </div>
      </div>

      <div className="flex min-h-[156px] flex-col items-center px-4 pb-5 pt-12 text-center">
        <span className="mb-2 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6e6e73]">
          Grupo {groupLabel}
        </span>
        <h3 className="min-h-[42px] text-[17px] font-extrabold leading-tight tracking-tight text-[#1d1d1f]">
          {getTeamDisplayName(team.name)}
        </h3>
        <Link
          href={`/jugadores?team=${team.slug || team.id}`}
          className="mt-auto inline-flex items-center rounded-full bg-[#1d1d1f] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#0071e3]"
        >
          Ver plantel
        </Link>
      </div>
    </article>
  )
}
