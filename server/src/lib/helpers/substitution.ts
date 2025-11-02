import { Formation, FormationResult, Player } from "../formatter/types";

type Category = "goalkeeper" | "defenders" | "midfielders" | "forwards";
type EnrichedPlayer = Player & { isAvlSub: boolean };

const FORMATION_RULES: Record<Category, { min: number; max: number }> = {
  goalkeeper: { min: 1, max: 1 },
  defenders: { min: 3, max: 5 },
  midfielders: { min: 2, max: 5 },
  forwards: { min: 1, max: 3 },
};

function getPositionCategory(
  position: string
): Category {
  const positionMap: Record<string, Category> = {
    GK: "goalkeeper",
    DEF: "defenders",
    MID: "midfielders",
    FWD: "forwards",
  };
  return positionMap[position];
}

function countStartingPlayers(starting: Formation) {
  return {
    goalkeeper: starting.goalkeeper.length,
    defenders: starting.defenders.length,
    midfielders: starting.midfielders.length,
    forwards: starting.forwards.length,
  };
}

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

// Assumes Player may have an optional numeric `subNumber` (bench order 1–3).
// If your model uses a different key (e.g., benchOrder), rename `subNumber` accordingly.

export const executeSwap = (
  teamData: Pick<FormationResult, "starting" | "bench">,
  playerNameA: string,
  playerNameB: string
) => {
  if (playerNameA === playerNameB) {
    return { error: "Cannot swap the same player" as const };
  }

  const findInStarting = (
    name: string
  ): { category: Category; index: number; player: Player } | null => {
    for (const k in teamData.starting) {
      const category = k as Category;
      const idx = teamData.starting[category].findIndex((p) => p.name === name);
      if (idx !== -1) {
        return { category, index: idx, player: teamData.starting[category][idx] };
      }
    }
    return null;
  };

  const startInfoA = findInStarting(playerNameA);
  const startInfoB = findInStarting(playerNameB);

  const benchIndexA = teamData.bench.findIndex((p) => p.name === playerNameA);
  const benchIndexB = teamData.bench.findIndex((p) => p.name === playerNameB);

  let startingInfo:
    | { category: Category; index: number; player: Player }
    | null = null;
  let benchInfo: { index: number; player: Player } | null = null;

  if (startInfoA && benchIndexB !== -1) {
    startingInfo = startInfoA;
    benchInfo = { index: benchIndexB, player: teamData.bench[benchIndexB] };
  } else if (startInfoB && benchIndexA !== -1) {
    startingInfo = startInfoB;
    benchInfo = { index: benchIndexA, player: teamData.bench[benchIndexA] };
  } else {
    if ((!startInfoA && benchIndexA === -1) || (!startInfoB && benchIndexB === -1)) {
      return { error: "One or both players not found" as const };
    }
    return { error: "Swap requires one starting and one bench player" as const };
  }

  const currentCounts = countStartingPlayers(teamData.starting);
  const outCat = startingInfo.category;
  const inCat = getPositionCategory(benchInfo.player.position);

  if (!canSwap(currentCounts, outCat, inCat)) {
    return { error: "Swap violates formation rules" as const };
  }

  // Clone
  const newStarting: Formation = {
    goalkeeper: [...teamData.starting.goalkeeper],
    defenders: [...teamData.starting.defenders],
    midfielders: [...teamData.starting.midfielders],
    forwards: [...teamData.starting.forwards],
  };
  const newBench: Player[] = [...teamData.bench];

  // Move bench order (subNumber) from bench player to the demoted starter; clear on promoted
  const benchSubNo =
    (benchInfo.player as any).subNumber ??
    (typeof benchInfo.index === "number" ? benchInfo.index + 1 : undefined);

  const promotedToStarting: Player = {
    ...(benchInfo.player as any),
    ...(benchSubNo !== undefined ? { subNumber: undefined } : {}),
  };
  const demotedToBench: Player = {
    ...(startingInfo.player as any),
    ...(benchSubNo !== undefined ? { subNumber: benchSubNo } : {}),
  };

  // Apply swap with correct category placement
  if (inCat === outCat) {
    // Simple in-place replacement when positions match
    newStarting[outCat][startingInfo.index] = promotedToStarting;
  } else {
    // Remove starter from its category
    newStarting[outCat] = [
      ...newStarting[outCat].slice(0, startingInfo.index),
      ...newStarting[outCat].slice(startingInfo.index + 1),
    ];
    // Add promoted player to the correct category (append to end)
    newStarting[inCat] = [...newStarting[inCat], promotedToStarting];
  }

  // Update bench: place demoted starter where the bench player was taken from
  newBench[benchInfo.index] = demotedToBench;

  const nextCounts = countStartingPlayers(newStarting);

  return {
    starting: newStarting,
    bench: newBench,
    // swappedIn: promotedToStarting,
    // swappedOut: demotedToBench,
    currentFormation: `${nextCounts.defenders}-${nextCounts.midfielders}-${nextCounts.forwards}`,
  };
};



