import { calculateMatchPoints } from "../src/lib/server/scoring";
import { calculatePrizePool, PRIZE_DISTRIBUTION } from "../src/lib/prize-pool";

type Case = {
  name: string;
  input: [number, number, number, number];
  expectedPoints: number;
};

const cases: Case[] = [
  { name: "Real 2-1, pred 2-1", input: [2, 1, 2, 1], expectedPoints: 5 },
  { name: "Real 2-1, pred 3-2", input: [3, 2, 2, 1], expectedPoints: 4 },
  { name: "Real 2-1, pred 3-1", input: [3, 1, 2, 1], expectedPoints: 3 },
  { name: "Real 2-1, pred 1-1", input: [1, 1, 2, 1], expectedPoints: 0 },
  { name: "Real 1-1, pred 0-0", input: [0, 0, 1, 1], expectedPoints: 4 },
  { name: "Real 0-0, pred 0-0", input: [0, 0, 0, 0], expectedPoints: 5 },
];

for (const item of cases) {
  const result = calculateMatchPoints(...item.input);
  if (result.points !== item.expectedPoints) {
    throw new Error(`${item.name}: expected ${item.expectedPoints}, got ${result.points}`);
  }
}

const pool = calculatePrizePool({ activeParticipants: 47, dolarBlueVenta: 1200 });
if (pool.poolARS !== 235000) throw new Error(`Expected poolARS 235000, got ${pool.poolARS}`);
if (pool.rankingPrizeARS !== 164500) throw new Error(`Expected ranking prize 164500, got ${pool.rankingPrizeARS}`);
if (pool.championPrizeARS !== 35250) throw new Error(`Expected champion prize 35250, got ${pool.championPrizeARS}`);
if (pool.topScorerPrizeARS !== 35250) throw new Error(`Expected top scorer prize 35250, got ${pool.topScorerPrizeARS}`);
if (PRIZE_DISTRIBUTION.ranking + PRIZE_DISTRIBUTION.champion + PRIZE_DISTRIBUTION.topScorer !== 100) {
  throw new Error("Prize distribution must add up to 100");
}

console.log("Scoring and prize pool validation passed.");
