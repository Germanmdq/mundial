"use client";

import React from 'react'
import Link from 'next/link'
import type { Team } from '@/lib/worldcup/teams'
import { getTeamAssetSources } from '@/lib/worldcup/assets'
import { SafeAssetImage } from '@/components/worldcup/SafeAssetImage'
import { getTeamDisplayName, getTeamCode } from '@/lib/worldcup/team-display-names'
import { getFifaTeamProfile } from '@/lib/worldcup/team-history'

type TeamCardProps = {
  team: Team
  playerCount: number
}

function FlagFallback({ code }: { code: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[12px] font-black tracking-widest text-[#1d1d1f]">
      {code ?? 'FIFA'}
    </div>
  )
}

export function TeamCard({ team, playerCount }: TeamCardProps) {
  const flagSources = [...getTeamAssetSources(team.team_assets, 'flag', team.slug), team.flag_url].filter((source): source is string => Boolean(source))
  
  const displayName = getTeamDisplayName(team.name);
  const code = getTeamCode(team.name);
  const groupLabel = team.group_letter || team.group_name?.replace(/^Grupo\s+/i, '') || '-'

  let statusText = "Plantel en actualización";
  let statusColor = "text-[#6e6e73]";
  if (playerCount > 0 && playerCount < 26) {
    statusText = `${playerCount} jugadores en revisión`;
    statusColor = "text-[#c9a227]";
  } else if (playerCount >= 26) {
    statusText = `Plantel cargado · ${playerCount} jugadores`;
    statusColor = "text-[#0071e3]";
  }

  // FIFA History Profile
  const profile = getFifaTeamProfile(team.slug);
  const isImported = profile?.status === 'imported';
  const bestResult = profile?.bestResult || null;
  const appearances = profile?.appearancesCount || null;
  const titlesCount = bestResult === 'Campeon' ? (profile?.bestResultYears?.length || 0) : 0;

  return (
    <article className="teamCard">
      <div className="teamCardTop">
        <div className="teamFlag shrink-0 overflow-hidden bg-white">
          <SafeAssetImage
            src={flagSources}
            alt={`Bandera de ${displayName}`}
            className="h-full w-full object-cover"
            fallback={<FlagFallback code={code} />}
          />
        </div>
        <span className="teamCodeGhost">{code}</span>
      </div>

      <div className="flex-1 mt-6">
        <h3 className="teamName truncate">{displayName}</h3>
        <p className="teamMeta truncate">
          {code} · Grupo {groupLabel}
        </p>
        <p className={`teamStatus truncate ${statusColor}`}>{statusText}</p>

        {/* FIFA HISTORICAL PROFILE DATA */}
        <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)] flex flex-col gap-1 text-[13px] text-[#6e6e73]">
          {isImported ? (
            <>
              <div className="flex items-center gap-1.5 font-extrabold text-[#0071e3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
                <span>Historia cargada</span>
              </div>
              <div className="font-extrabold text-[#1d1d1f]">
                {titlesCount > 0 ? `${titlesCount} ${titlesCount === 1 ? 'título' : 'títulos'} · ` : ""}
                {appearances} participaciones
              </div>
              <div className="font-medium text-[#1d1d1f] truncate">
                Mejor: <span className="font-extrabold">{bestResult === 'Campeon' ? 'Campeón' : bestResult}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-[#8e8e93] font-extrabold italic">
              <span className="w-1.5 h-1.5 rounded-full bg-[#aeaeb2]"></span>
              <span>Historia en revisión</span>
            </div>
          )}
        </div>
      </div>

      <Link
        href={`/jugadores?team=${team.slug || team.id}`}
        className="teamAction"
      >
        Ver plantel
      </Link>

      <style jsx>{`
        .teamCard {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 28px;
          padding: 24px;
          min-height: 220px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.055);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }

        .teamCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 44px rgba(0,0,0,0.10);
          border-color: rgba(0,113,227,0.22);
        }

        .teamCardTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .teamFlag {
          width: 64px;
          height: 64px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .teamCodeGhost {
          position: absolute;
          right: 18px;
          top: 14px;
          font-size: 64px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.07em;
          color: rgba(0,0,0,0.035);
          pointer-events: none;
        }

        .teamName {
          font-size: 25px;
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: -0.035em;
          color: #1d1d1f;
        }

        .teamMeta {
          margin-top: 8px;
          color: #6e6e73;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .teamStatus {
          margin-top: 14px;
          font-size: 14px;
          font-weight: 700;
        }

        .teamAction {
          margin-top: 22px;
          align-self: flex-start;
          height: 38px;
          padding: 0 18px;
          border-radius: 999px;
          background: #1d1d1f;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background 180ms ease;
        }

        .teamAction:hover {
          background: #0071e3;
        }

        @media (max-width: 734px) {
          .teamCard {
            min-height: 190px;
            padding: 18px;
            border-radius: 24px;
          }

          .teamFlag {
            width: 48px;
            height: 48px;
          }

          .teamCodeGhost {
            font-size: 48px;
            right: 12px;
            top: 8px;
          }

          .teamName {
            font-size: 19px;
          }

          .teamAction {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </article>
  )
}
