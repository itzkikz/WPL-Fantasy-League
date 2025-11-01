import { Player } from "../../features/players/types";
import { Formation, TeamDetails } from "../../features/standings/types";

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

export const playerSwap = (
  teamData: Pick<TeamDetails, "starting" | "bench">,
  playerName: string,
  location: "starting" | "bench"
) => {
  // Find selected player and its category
  let selectedPlayer: Player | null = null;
  let selectedCategory: Category | null = null;

  if (location === "starting") {
    for (const k in teamData.starting) {
      const category = k as Category;
      const found = teamData.starting[category].find((p) => p.name === playerName);
      if (found) {
        selectedPlayer = found;
        selectedCategory = category;
        break;
      }
    }
  } else {
    selectedPlayer = teamData.bench.find((p) => p.name === playerName) ?? null;
    if (selectedPlayer) selectedCategory = getPositionCategory(selectedPlayer.position);
  }

  if (!selectedPlayer || !selectedCategory) {
    return { error: "Player not found" as const };
  }

  // Current formation counts
  const currentCounts = countStartingPlayers(teamData.starting);

  // Enrich starting with isAvlSub
  const enrichedStarting: {
    goalkeeper: EnrichedPlayer[];
    defenders: EnrichedPlayer[];
    midfielders: EnrichedPlayer[];
    forwards: EnrichedPlayer[];
  } = {
    goalkeeper: [],
    defenders: [],
    midfielders: [],
    forwards: [],
  };

  // Enrich bench with isAvlSub
  let enrichedBench: EnrichedPlayer[] = [];

  if (location === "starting") {
    // Selected is in starting: bench players may replace selected
    enrichedBench = teamData.bench.map((benchP) => {
      const benchCat = getPositionCategory(benchP.position);
      const ok = canSwap(currentCounts, selectedCategory!, benchCat);
      return { ...benchP, isAvlSub: ok };
    });

    // Starting players are not the counterpart set in this direction; mark all as false
    for (const k in teamData.starting) {
      const category = k as Category;
      enrichedStarting[category] = teamData.starting[category].map((p) => ({
        ...p,
        isAvlSub: false,
      }));
    }
  } else {
    // Selected is on bench: starting players may be benched for selected
    enrichedBench = teamData.bench.map((p) => ({
      ...p,
      isAvlSub: false, // counterparts are in starting for this direction
    }));

    for (const k in teamData.starting) {
      const category = k as Category;
      enrichedStarting[category] = teamData.starting[category].map((startP) => {
        const ok = canSwap(currentCounts, category, selectedCategory!);
        return { ...startP, isAvlSub: ok };
      });
    }
  }

  return {
    selectedPlayer,
    location,
    starting: enrichedStarting,
    bench: enrichedBench,
    currentFormation: `${currentCounts.defenders}-${currentCounts.midfielders}-${currentCounts.forwards}`,
  };
};

// Assumes Player may have an optional numeric `subNumber` (bench order 1–3).
// If your model uses a different key (e.g., benchOrder), rename `subNumber` accordingly.

export const executeSwap = (
  teamData: Pick<TeamDetails, "starting" | "bench">,
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
    swappedIn: promotedToStarting,
    swappedOut: demotedToBench,
    currentFormation: `${nextCounts.defenders}-${nextCounts.midfielders}-${nextCounts.forwards}`,
  };
};

export const clearSwapHighlights = (
  teamData: Pick<TeamDetails, "starting" | "bench">
) => {
  const starting: {
    goalkeeper: EnrichedPlayer[];
    defenders: EnrichedPlayer[];
    midfielders: EnrichedPlayer[];
    forwards: EnrichedPlayer[];
  } = {
    goalkeeper: teamData.starting.goalkeeper.map((p) => ({ ...p, isAvlSub: false })),
    defenders: teamData.starting.defenders.map((p) => ({ ...p, isAvlSub: false })),
    midfielders: teamData.starting.midfielders.map((p) => ({ ...p, isAvlSub: false })),
    forwards: teamData.starting.forwards.map((p) => ({ ...p, isAvlSub: false })),
  };
  const bench: EnrichedPlayer[] = teamData.bench.map((p) => ({ ...p, isAvlSub: false }));
  const counts = countStartingPlayers(teamData.starting);
  return {
    selectedPlayer: null as unknown as Player,
    location: "starting" as "starting",
    starting,
    bench,
    currentFormation: `${counts.defenders}-${counts.midfielders}-${counts.forwards}`,
  };
};



