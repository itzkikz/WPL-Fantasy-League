// New helpers for captaincy management.
// Assumes each Player may have optional boolean flags:
//   isCaptain?: boolean
//   isViceCaptain?: boolean
//
// Note: using "isCaptain" / "isViceCaptain" to match the provided spelling.

import { Formation, FormationResult, Player } from "../formatter/types";

type RoleKey = "isCaptain" | "isViceCaptain";

function setCaptaincyRole(
  teamData: Pick<FormationResult, "starting" | "bench">,
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
  teamData: Pick<FormationResult, "starting" | "bench">,
  playerName: string
) => setCaptaincyRole(teamData, playerName, "isCaptain");

// Public API: choose a vice-captain from starting or bench
export const setViceCaptain = (
  teamData: Pick<FormationResult, "starting" | "bench">,
  playerName: string
) => setCaptaincyRole(teamData, playerName, "isViceCaptain");
