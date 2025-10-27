// formationConverter.ts
import teamsData from './teamsData.json';
import { Player, PlayerData, FormationResult } from './types';

/**
 * Converts fantasy team API response to Formation format
 * @param playersData - Array of player objects with gw, team_name, player_name, position, lineup, role, club
 * @returns Object containing sampleTeam (Formation) and bench (Player[])
 */
export function convertToFormation(playersData: PlayerData[]): FormationResult {
  const { teams } = teamsData;

  // Position mapping
  const positionMap: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
    G: "GK",
    D: "DEF",
    M: "MID",
    F: "FWD",
  };

  // Helper function to get team data
  const getTeamData = (clubName: string) => {
    const teamData = teams[clubName as keyof typeof teams];
    return {
      abbreviation: teamData?.abbreviation || clubName?.substring(0, 3).toUpperCase(),
      color: teamData?.color || "#000000"
    };
  };

  // Helper function to map position
  const mapPosition = (pos: string): "GK" | "DEF" | "MID" | "FWD" => {
    return positionMap[pos] || (pos as "GK" | "DEF" | "MID" | "FWD");
  };

  // Separate lineup and bench players
  const lineupPlayers: Player[] = [];
  const benchPlayers: Player[] = [];

  const maxPoints = Math.max(...playersData.map(p => Number(p.point) || 0));

  playersData.forEach((playerData, index) => {
    const teamData = getTeamData(playerData.club);

    const player: Player = {
      id: index + 1,
      name: playerData.player_name,
      team: teamData.abbreviation,
      teamColor: teamData.color,
      point: playerData.point || 0,
      position: mapPosition(playerData.position),
      fullTeamName: playerData.club,
      app: playerData.app,
      clean_sheet: playerData.clean_sheet,
      goal: playerData.goal,
      assist: playerData.assist,
      yellow_card: playerData.yellow_card,
      red_card: playerData.red_card,
      save: playerData.save,
      penalty_save: playerData.penalty_save,
      penalty_miss: playerData.penalty_miss,
      gw: playerData.gw
    };

    // Add captain/vice captain flags
    if (playerData.role === "CAPTAIN") {
      player.isCaptain = true;
    } else if (playerData.role === "VICE CAPTAIN") {
      player.isViceCaptain = true;
    }

    // Separate lineup vs bench
    if ((playerData?.lineup)?.toLowerCase() === "starting xi") {
      lineupPlayers.push(player);
    } else if (playerData?.lineup?.toLowerCase().startsWith("sub ")) {
      // Extract sub number (with space: "sub 1", "sub 2", etc.)
      const subMatch = playerData.lineup.match(/sub\s+(\d+)/i);
      const subNumber = subMatch ? parseInt(subMatch[1]) : 999;
      player.subNumber = subNumber;
      benchPlayers.push(player);
    }

    const points = Number(playerData.point) || 0;
    player.isPowerPlayer = points === maxPoints;
  });

  // Sort bench players by sub number
  benchPlayers.sort((a, b) => (a.subNumber || 999) - (b.subNumber || 999));


  // Organize lineup by position
  const goalkeeper = lineupPlayers.filter((p) => p.position === "GK");
  const defenders = lineupPlayers.filter((p) => p.position === "DEF");
  const midfielders = lineupPlayers.filter((p) => p.position === "MID");
  const forwards = lineupPlayers.filter((p) => p.position === "FWD");

  // Return Formation object
  return {
    starting: {
      goalkeeper,
      defenders,
      midfielders,
      forwards,
    },
    bench: benchPlayers,
  };
}
