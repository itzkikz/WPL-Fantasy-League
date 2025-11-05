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

// Updated benchSwap to prevent GK swaps with outfield players
// Updated benchSwap with consistent return structure
export const benchSwap = (
  teamData: Pick<TeamDetails, "starting" | "bench">,
  playerNameA: string,
  playerNameB: string
) => {
  if (playerNameA === playerNameB) {
    return { error: "Cannot swap the same player" as const };
  }

  const benchIndexA = teamData.bench.findIndex((p) => p.name === playerNameA);
  const benchIndexB = teamData.bench.findIndex((p) => p.name === playerNameB);

  if (benchIndexA === -1 || benchIndexB === -1) {
    return { error: "One or both players not found on bench" as const };
  }

  const playerA = teamData.bench[benchIndexA];
  const playerB = teamData.bench[benchIndexB];

  // Prevent GK from swapping with outfield players on bench
  const isAGoalkeeper = playerA.position === "GK";
  const isBGoalkeeper = playerB.position === "GK";

  if (isAGoalkeeper !== isBGoalkeeper) {
    return { error: "Bench goalkeeper cannot swap with outfield players" as const };
  }

  // Clone bench array
  const newBench: Player[] = [...teamData.bench];
  
  // Swap their subNumber values if they exist
  const subNoA = (playerA as any).subNumber;
  const subNoB = (playerB as any).subNumber;
  
  // Create swapped players with exchanged subNumbers
  const playerASwapped: Player = {
    ...playerB,
    ...(subNoA !== undefined ? { subNumber: subNoA } : 
        subNoB !== undefined ? { subNumber: undefined } : {})
  };
  
  const playerBSwapped: Player = {
    ...playerA,
    ...(subNoB !== undefined ? { subNumber: subNoB } : 
        subNoA !== undefined ? { subNumber: undefined } : {})
  };
  
  // Swap positions in array
  newBench[benchIndexA] = playerASwapped;
  newBench[benchIndexB] = playerBSwapped;

  const counts = countStartingPlayers(teamData.starting);

  return {
    starting: teamData.starting,
    bench: newBench,
    swappedIn: playerASwapped,  // Added for consistency
    swappedOut: playerBSwapped, // Added for consistency
    currentFormation: `${counts.defenders}-${counts.midfielders}-${counts.forwards}`,
  };
};


// Enhanced playerSwap with GK bench restrictions
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
    // ALSO: other bench players can swap positions with selected (except GK)
    const selectedIsGK = selectedPlayer.position === "GK";

    enrichedBench = teamData.bench.map((p) => {
      if (p.name === playerName) {
        return { ...p, isAvlSub: false };
      }
      // GK can only swap with GK (none on bench), outfield can swap with outfield
      const pIsGK = p.position === "GK";
      const canSwapOnBench = selectedIsGK === pIsGK;
      return { ...p, isAvlSub: canSwapOnBench };
    });

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


// Enhanced executeSwap to handle both starting-bench and bench-bench swaps
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

  // Check if both players are on the bench - delegate to benchSwap
  if (benchIndexA !== -1 && benchIndexB !== -1) {
    return benchSwap(teamData, playerNameA, playerNameB);
  }

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

// New helpers for captaincy management.
// Assumes each Player may have optional boolean flags:
//   isCaptain?: boolean
//   isViceCaptain?: boolean
//
// Note: using "isCaptain" / "isViceCaptain" to match the provided spelling.

type RoleKey = "isCaptain" | "isViceCaptain";

function setCaptaincyRole(
  teamData: Pick<TeamDetails, "starting" | "bench">,
  playerName: string,
  roleKey: RoleKey
):
  | {
    starting: Formation;
    bench: Player[];
    role: RoleKey;
    assignedTo: string;
  }
  | { error: "Player not found" } {
  const otherKey: RoleKey = roleKey === "isCaptain" ? "isViceCaptain" : "isCaptain";

  // Verify the player exists in either starting or bench
  const inStarting =
    teamData.starting.goalkeeper.some(p => p.name === playerName) ||
    teamData.starting.defenders.some(p => p.name === playerName) ||
    teamData.starting.midfielders.some(p => p.name === playerName) ||
    teamData.starting.forwards.some(p => p.name === playerName);

  const inBench = teamData.bench.some(p => p.name === playerName);
  if (!inStarting && !inBench) {
    return { error: "Player not found" };
  }

  // Update all players immutably:
  // - The selected player: set chosen role true, and clear the other role
  // - All other players: clear the chosen role
  const mapRoleUpdate = (p: Player): Player => {
    if (p.name === playerName) {
      return {
        ...(p as any),
        [roleKey]: true,
        [otherKey]: false,
      };
    }
    return {
      ...(p as any),
      [roleKey]: false,
    };
  };

  const newStarting: Formation = {
    goalkeeper: teamData.starting.goalkeeper.map(mapRoleUpdate),
    defenders: teamData.starting.defenders.map(mapRoleUpdate),
    midfielders: teamData.starting.midfielders.map(mapRoleUpdate),
    forwards: teamData.starting.forwards.map(mapRoleUpdate),
  };

  const newBench: Player[] = teamData.bench.map(mapRoleUpdate);

  return {
    starting: newStarting,
    bench: newBench,
    role: roleKey,
    assignedTo: playerName,
  };
}

// Public API: choose a captain from starting or bench
export const setCaptain = (
  teamData: Pick<TeamDetails, "starting" | "bench">,
  playerName: string
) => setCaptaincyRole(teamData, playerName, "isCaptain");

// Public API: choose a vice-captain from starting or bench
export const setViceCaptain = (
  teamData: Pick<TeamDetails, "starting" | "bench">,
  playerName: string
) => setCaptaincyRole(teamData, playerName, "isViceCaptain");




