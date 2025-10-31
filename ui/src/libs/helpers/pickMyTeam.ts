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

export const handlePlayerSwap = (
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
