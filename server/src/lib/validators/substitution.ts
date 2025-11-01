import { TeamDetails } from "../../types/standings";
import { Formation, FormationResult, Player } from "../formatter/types";

type Category = "goalkeeper" | "defenders" | "midfielders" | "forwards";

function getPositionCategory(position: string): Category {
  const map: Record<string, Category> = { GK: "goalkeeper", DEF: "defenders", MID: "midfielders", FWD: "forwards" };
  return map[position];
}

function countStartingPlayers(starting: Formation) {
  return {
    goalkeeper: starting.goalkeeper.length,
    defenders: starting.defenders.length,
    midfielders: starting.midfielders.length,
    forwards: starting.forwards.length,
  };
}

const FORMATION_RULES: Record<Category, { min: number; max: number }> = {
  goalkeeper: { min: 1, max: 1 },
  defenders: { min: 3, max: 5 },
  midfielders: { min: 2, max: 5 },
  forwards: { min: 1, max: 3 },
};

function canSwap(
  counts: Record<Category, number>,
  outCat: Category,
  inCat: Category
) {
  const next = { ...counts };
  next[outCat]--;
  next[inCat]++;
  return (
    next.goalkeeper >= FORMATION_RULES.goalkeeper.min &&
    next.goalkeeper <= FORMATION_RULES.goalkeeper.max &&
    next.defenders >= FORMATION_RULES.defenders.min &&
    next.defenders <= FORMATION_RULES.defenders.max &&
    next.midfielders >= FORMATION_RULES.midfielders.min &&
    next.midfielders <= FORMATION_RULES.midfielders.max &&
    next.forwards >= FORMATION_RULES.forwards.min &&
    next.forwards <= FORMATION_RULES.forwards.max
  );
}

function findInStarting(
  starting: Formation,
  predicate: (p: Player) => boolean
): { category: Category; index: number; player: Player } | null {
  for (const k in starting) {
    const category = k as Category;
    const idx = starting[category].findIndex(predicate);
    if (idx !== -1) return { category, index: idx, player: starting[category][idx] };
  }
  return null;
}

export const validateSwapAuto = (
  teamData: Pick<FormationResult, "starting" | "bench">,
  a: Player,
  b: Player
): { ok: boolean; reason?: string; outCat?: Category; inCat?: Category } => {
  // Define your membership rule based on subNumber:
  // - Starters: subNumber === 0 or undefined
  // - Bench: subNumber > 0 (bench order)
  const isStarterBySubNumber = (p: Player) =>
    p.subNumber === 0 || p.subNumber == null;

  const aIsStarter = isStarterBySubNumber(a);
  const bIsStarter = isStarterBySubNumber(b);
  const aIsBench = !aIsStarter;
  const bIsBench = !bIsStarter;

  // Must be one starter and one bench
  if (!(aIsStarter || bIsStarter) || !(aIsBench || bIsBench)) {
    return {
      ok: false,
      reason: "One player must be in starting XI and the other on the bench",
    };
  }
  if ((aIsStarter && bIsStarter) || (aIsBench && bIsBench)) {
    return {
      ok: false,
      reason: "Swap must be between one starter and one bench player",
    };
  }

  // Normalize roles based purely on subNumber
  const outCat = getPositionCategory((aIsStarter ? a : b).position);
  const inCat = getPositionCategory((aIsBench ? a : b).position);

  // Validate formation after hypothetical swap
  const counts = countStartingPlayers(teamData.starting);
  const ok = canSwap(counts, outCat, inCat);

  return ok
    ? { ok: true, outCat, inCat }
    : { ok: false, reason: "Swap violates formation rules", outCat, inCat };
};


// Validate that a swap has ALREADY been applied: swapIn is now in starting,
// swapOut is now on the bench (optionally with a subNumber), and formation is valid.
export const validateExecutedSwapAuto = (
  teamData: Pick<FormationResult, 'starting' | 'bench'>,
  swapIn: Player,
  swapOut: Player
): { ok: boolean; reason?: string } => {
  const inNow = findInStarting(teamData.starting, (p) => p.id === swapIn.id || p.name === swapIn.name);
  const outNowBenchIdx = teamData.bench.findIndex((p) => p.id === swapOut.id || p.name === swapOut.name);

  if (!inNow) return { ok: false, reason: "swapIn is not in starting XI" };
  if (outNowBenchIdx === -1) return { ok: false, reason: "swapOut is not on the bench" };

  // Optional: subNumber presence check (if your model uses it)
  // const hasBenchOrder = (teamData.bench[outNowBenchIdx] as any)?.subNumber != null;

  // Verify formation still valid
  const counts = countStartingPlayers(teamData.starting);
  const valid =
    counts.goalkeeper >= FORMATION_RULES.goalkeeper.min &&
    counts.goalkeeper <= FORMATION_RULES.goalkeeper.max &&
    counts.defenders >= FORMATION_RULES.defenders.min &&
    counts.defenders <= FORMATION_RULES.defenders.max &&
    counts.midfielders >= FORMATION_RULES.midfielders.min &&
    counts.midfielders <= FORMATION_RULES.midfielders.max &&
    counts.forwards >= FORMATION_RULES.forwards.min &&
    counts.forwards <= FORMATION_RULES.forwards.max;

  return valid ? { ok: true } : { ok: false, reason: "Formation invalid after swap" };
};
