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
  swapInName: string,   // player to swap in
  swapOutName: string,  // player to swap out
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

  // Check if both players are on bench - handle bench-to-bench swap
  if (benchInIdx !== -1 && benchOutIdx !== -1) {
    const playerIn = oldTeam.bench[benchInIdx];
    const playerOut = oldTeam.bench[benchOutIdx];

    // Prevent GK from swapping with outfield players on bench
    const isInGoalkeeper = playerIn.position === "GK";
    const isOutGoalkeeper = playerOut.position === "GK";

    if (isInGoalkeeper !== isOutGoalkeeper) {
      return { ok: false as const, error: "Bench goalkeeper cannot swap with outfield players" };
    }

    // Clone bench array
    const newBench = [...oldTeam.bench];
    
    // Swap their subNumber values if they exist
    const subNoIn = (playerIn as any).subNumber;
    const subNoOut = (playerOut as any).subNumber;
    
    // Create swapped players with exchanged subNumbers
    const playerInSwapped = {
      ...playerOut,
      ...(subNoIn !== undefined ? { subNumber: subNoIn } : 
          subNoOut !== undefined ? { subNumber: undefined } : {})
    };
    
    const playerOutSwapped = {
      ...playerIn,
      ...(subNoOut !== undefined ? { subNumber: subNoOut } : 
          subNoIn !== undefined ? { subNumber: undefined } : {})
    };
    
    // Swap positions in array
    newBench[benchInIdx] = playerInSwapped;
    newBench[benchOutIdx] = playerOutSwapped;

    const counts = countStartingPlayers(oldTeam.starting);

    return {
      ok: true as const,
      starting: oldTeam.starting,
      bench: newBench,
      swappedIn: playerInSwapped,
      swappedOut: playerOutSwapped,
      currentFormation: `${counts.defenders}-${counts.midfielders}-${counts.forwards}`,
    };
  }

  // Exactly one starting and one bench (original behavior)
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
