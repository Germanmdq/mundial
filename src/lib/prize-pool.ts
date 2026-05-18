export const BASE_PARTICIPANTS = 47;
export const ENTRY_AMOUNT_ARS = 5000;
export const ENTRY_AMOUNT_USD = 5;

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

  const poolUSDBlue =
    dolarBlueVenta && dolarBlueVenta > 0
      ? poolARS / dolarBlueVenta
      : null;

  return {
    participants,
    poolARS,
    poolUSDBlue,
    dolarBlueVenta,
  };
}
