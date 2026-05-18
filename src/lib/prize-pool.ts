export const BASE_PARTICIPANTS = 47;
export const ENTRY_AMOUNT_ARS = 5000;
export const ENTRY_AMOUNT_USD = 5;
export const PRIZE_DISTRIBUTION = {
  ranking: 70,
  champion: 15,
  topScorer: 15,
} as const;

export function calculatePrizePool({
  activeParticipants,
  dolarBlueVenta,
}: {
  activeParticipants?: number | null;
  dolarBlueVenta?: number | null;
}) {
  // Use fallback BASE_PARTICIPANTS if activeParticipants is less
  const participants = Math.max(
    BASE_PARTICIPANTS,
    activeParticipants ?? BASE_PARTICIPANTS
  );

  const poolARS = participants * ENTRY_AMOUNT_ARS;
  const rankingPrizeARS = poolARS * (PRIZE_DISTRIBUTION.ranking / 100);
  const championPrizeARS = poolARS * (PRIZE_DISTRIBUTION.champion / 100);
  const topScorerPrizeARS = poolARS * (PRIZE_DISTRIBUTION.topScorer / 100);

  const poolUSDBlue =
    dolarBlueVenta && dolarBlueVenta > 0
      ? poolARS / dolarBlueVenta
      : null;

  return {
    participants,
    poolARS,
    poolUSDBlue,
    blueRate: dolarBlueVenta ?? null,
    rankingPrizeARS,
    championPrizeARS,
    topScorerPrizeARS,
    entryAmountARS: ENTRY_AMOUNT_ARS,
    distribution: PRIZE_DISTRIBUTION,
  };
}
