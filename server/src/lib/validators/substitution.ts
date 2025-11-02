import { Formation, FormationResult } from "../formatter/types";

type Category = "goalkeeper" | "defenders" | "midfielders" | "forwards";

const FORMATION_RULES: Record<Category, { min: number; max: number }> = {
  goalkeeper: { min: 1, max: 1 },
  defenders: { min: 3, max: 5 },
  midfielders: { min: 2, max: 5 },
  forwards: { min: 1, max: 3 },
};

function getPositionCategory(pos: string): Category {
  const map: Record<string, Category> = { GK: "goalkeeper", DEF: "defenders", MID: "midfielders", FWD: "forwards" };
  return map[pos];
}

function countStartingPlayers(starting: Formation) {
  return {
    goalkeeper: starting.goalkeeper.length,
    defenders: starting.defenders.length,
    midfielders: starting.midfielders.length,
    forwards: starting.forwards.length,
  };
}

function canSwap(counts: Record<Category, number>, outCat: Category, inCat: Category) {
  const next = { ...counts };
  next[outCat]--;
  next[inCat]++;
  return Object.entries(FORMATION_RULES).every(([cat, { min, max }]) => {
    const c = next[cat as Category];
    return c >= min && c <= max;
  });
}

export function validateAndApplySwap(
  oldTeam: Pick<FormationResult, "starting" | "bench">,
  swapInName: string,   // must be on bench in oldTeam
  swapOutName: string,  // must be in starting in oldTeam
) {
  if (swapInName === swapOutName) {
    return { ok: false as const, error: "Cannot swap the same player" };
  }

  // Find players and locations in the authoritative snapshot
  const findStarting = (name: string) => {
    for (const k of ["goalkeeper", "defenders", "midfielders", "forwards"] as Category[]) {
      const idx = oldTeam.starting[k].findIndex(p => p.name === name);
      if (idx !== -1) return { category: k, index: idx, player: oldTeam.starting[k][idx] };
    }
    return null;
  };

  const startOut = findStarting(swapOutName);
  const startIn  = findStarting(swapInName);
  const benchInIdx = oldTeam.bench.findIndex(p => p.name === swapInName);
  const benchOutIdx = oldTeam.bench.findIndex(p => p.name === swapOutName);

  // Exactly one starting and one bench
  if (!startOut || benchInIdx === -1 || startIn || benchOutIdx !== -1) {
    return { ok: false as const, error: "Swap requires one starting and one bench player" };
  }

  // Derive categories from stored positions
  const outCat = startOut.category;
  const inCat = getPositionCategory(oldTeam.bench[benchInIdx].position);

  // Formation feasibility
  const counts = countStartingPlayers(oldTeam.starting);
  if (!canSwap(counts, outCat, inCat)) {
    return { ok: false as const, error: "Swap violates formation rules" };
  }

  // Compute canonical post-swap team
  const newStarting: Formation = {
    goalkeeper: [...oldTeam.starting.goalkeeper],
    defenders:  [...oldTeam.starting.defenders],
    midfielders:[...oldTeam.starting.midfielders],
    forwards:   [...oldTeam.starting.forwards],
  };
  const newBench = [...oldTeam.bench];

  // Bench order handling
  const benchPlayer = newBench[benchInIdx];
  const benchSubNo = (benchPlayer as any).subNumber ?? (benchInIdx + 1);

  const promoted = { ...(benchPlayer as any) };
  if (benchSubNo !== undefined) delete (promoted as any).subNumber;

  const demoted = { ...(startOut.player as any) };
  if (benchSubNo !== undefined) (demoted as any).subNumber = benchSubNo;

  // Apply swap
  if (inCat === outCat) {
    newStarting[outCat][startOut.index] = promoted;
  } else {
    newStarting[outCat] = newStarting[outCat].filter((_, i) => i !== startOut.index);
    newStarting[inCat] = [...newStarting[inCat], promoted];
  }
  newBench[benchInIdx] = demoted;

  const next = countStartingPlayers(newStarting);
  return {
    ok: true as const,
    starting: newStarting,
    bench: newBench,
    swappedIn: promoted,
    swappedOut: demoted,
    currentFormation: `${next.defenders}-${next.midfielders}-${next.forwards}`,
  };
}
