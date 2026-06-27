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
  playerId: number,
  roleKey: RoleKey
):
  | {
    starting: Formation;
    bench: Player[];
    role: RoleKey;
    assignedTo: number;
  }
  | { error: "Player not found" } {
  const otherKey: RoleKey = roleKey === "isCaptain" ? "isViceCaptain" : "isCaptain";

  // Verify the player exists in either starting or bench
  const inStarting =
    teamData.starting.GK.some((p: Player) => p.id === playerId) ||
    teamData.starting.DEF.some((p: Player) => p.id === playerId) ||
    teamData.starting.MID.some((p: Player) => p.id === playerId) ||
    teamData.starting.FWD.some((p: Player) => p.id === playerId);

  const inBench = teamData.bench.some(p => p.id === playerId);
  if (!inStarting && !inBench) {
    return { error: "Player not found" };
  }

  // Update all players immutably:
  // - The selected player: set chosen role true, and clear the other role
  // - All other players: clear the chosen role
  const mapRoleUpdate = (p: Player): Player => {
    if (p.id === playerId) {
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
    GK: teamData.starting.GK.map(mapRoleUpdate),
    DEF: teamData.starting.DEF.map(mapRoleUpdate),
    MID: teamData.starting.MID.map(mapRoleUpdate),
    FWD: teamData.starting.FWD.map(mapRoleUpdate),
  };

  const newBench: Player[] = teamData.bench.map(mapRoleUpdate);

  return {
    starting: newStarting,
    bench: newBench,
    role: roleKey,
    assignedTo: playerId,
  };
}

// Public API: choose a captain from starting or bench
export const setCaptain = (
  teamData: Pick<FormationResult, "starting" | "bench">,
  playerId: number
) => setCaptaincyRole(teamData, playerId, "isCaptain");

// Public API: choose a vice-captain from starting or bench
export const setViceCaptain = (
  teamData: Pick<FormationResult, "starting" | "bench">,
  playerId: number
) => setCaptaincyRole(teamData, playerId, "isViceCaptain");
