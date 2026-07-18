// formationConverter.ts
import { Player, FormationResult } from './types';
import { TeamDetails } from '../../types/standings';

/**
 * Converts fantasy team API response to Formation format
 * @param playersData - Array of player objects with gw, team_name, player_name, position, lineup, role, club
 * @returns Object containing sampleTeam (Formation) and bench (Player[])
 */
export function convertToFormation(playersData: TeamDetails[]): FormationResult {

  // Position mapping
  const positionMap: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
    G: "GK",
    D: "DEF",
    M: "MID",
    F: "FWD",
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

    const player: Player = {
      id: playerData.player_id || index + 1,
      name: playerData.player_name,
      team: playerData.team_short_name || playerData.club?.substring(0, 3).toUpperCase() || "UNK",
      teamColor: (playerData.team_color && playerData.team_color !== "#000000") ? playerData.team_color : "#003399", // Default blue fallback instead of black? Or keep black.
      teamTextColor: playerData.team_text_color || "#ffffff",
      point: playerData.point || 0,
      position: mapPosition(playerData.position),
      fullTeamName: playerData.club,
      gw: playerData.gw,
      shirtNumber: playerData.shirtNumber,
      photo: playerData.photo,
      auctionPrice: playerData.auctionPrice,
      playerStats: playerData.playerStats
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
    player.isPowerPlayer = points > 0 && points === maxPoints;
  });

  // Sort bench players by sub number
  benchPlayers.sort((a, b) => (a.subNumber || 999) - (b.subNumber || 999));


  // Organize lineup by position
  const GK = lineupPlayers.filter((p) => p.position === "GK");
  const DEF = lineupPlayers.filter((p) => p.position === "DEF");
  const MID = lineupPlayers.filter((p) => p.position === "MID");
  const FWD = lineupPlayers.filter((p) => p.position === "FWD");

  // Return Formation object
  return {
    starting: {
      GK,
      DEF,
      MID,
      FWD,
    },
    bench: benchPlayers,
  };
}
