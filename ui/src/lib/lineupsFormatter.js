/**
 * Converts fantasy team API response to Formation format
 * @param {Object} apiResponse - The API response object with success and data properties
 * @returns {Object} Object containing sampleTeam (Formation) and bench (Player[])
 */
export const convertToFormation = (apiResponse) => {
  // Team color mapping
  const teamColors = {
    "Napoli": "#0066CC",
    "Roma": "#8B0304",
    "Newcastle United": "#241F20",
    "Arsenal": "#EF0107",
    "FC Bayern München": "#DC052D",
    "Crystal Palace": "#1B458F",
    "Paris Saint-Germain": "#004170",
    "Aston Villa": "#670E36",
    "Barcelona": "#A50044",
    "Fiorentina": "#5B2B82",
    "Eintracht Frankfurt": "#E1000F",
    "Lazio": "#87CEEB",
    "Chelsea": "#034694",
    "Juventus": "#000000",
    "Olympique Lyonnais": "#1E4A99"
  };

  // Team abbreviation mapping
  const teamAbbreviations = {
    "Napoli": "NAP",
    "Roma": "ROM",
    "Newcastle United": "NEW",
    "Arsenal": "ARS",
    "FC Bayern München": "BAY",
    "Crystal Palace": "CRY",
    "Paris Saint-Germain": "PSG",
    "Aston Villa": "AVL",
    "Barcelona": "BAR",
    "Fiorentina": "FIO",
    "Eintracht Frankfurt": "FRA",
    "Lazio": "LAZ",
    "Chelsea": "CHE",
    "Juventus": "JUV",
    "Olympique Lyonnais": "LYO"
  };

  // Position mapping
  const positionMap = {
    "G": "GKP",
    "D": "DEF",
    "M": "MID",
    "F": "FWD"
  };

  // Helper function to get team abbreviation
  const getTeamAbbr = (teamName) => {
    return teamAbbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
  };

  // Helper function to extract points
  const extractPoints = (pointsStr) => {
    return parseInt(pointsStr.split(' / ')[0]);
  };

  // Helper function to map position
  const mapPosition = (pos) => {
    return positionMap[pos] || pos;
  };

  // Separate lineup and bench players
  const lineupPlayers = [];
  const benchPlayers = [];

  apiResponse.data.forEach((playerData, index) => {
    const player = {
      id: index + 1,
      name: playerData.player,
      team: getTeamAbbr(playerData.team),
      teamColor: teamColors[playerData.team] || "#000000",
      points: extractPoints(playerData.points),
      position: mapPosition(playerData.position)
    };

    // Add captain/vice captain flags
    if (playerData["c/vc"] === "CAPTAIN") {
      player.isCaptain = true;
    } else if (playerData["c/vc"] === "VICE CAPTAIN") {
      player.isViceCaptain = true;
    }

    // Separate lineup vs bench
    if (playerData.lineup === "TRUE") {
      lineupPlayers.push(player);
    } else {
      benchPlayers.push({
        subOrder: playerData["c/vc"],
        player: player
      });
    }
  });

  // Sort bench by sub order
  const subOrderMap = { "SUB 1": 1, "SUB 2": 2, "SUB 3": 3, "SUB 4": 4 };
  benchPlayers.sort((a, b) => {
    const orderA = subOrderMap[a.subOrder] || 99;
    const orderB = subOrderMap[b.subOrder] || 99;
    return orderA - orderB;
  });

  const bench = benchPlayers.map(item => item.player);

  // Organize lineup by position
  const goalkeeper = lineupPlayers.filter(p => p.position === "GKP");
  const defenders = lineupPlayers.filter(p => p.position === "DEF");
  const midfielders = lineupPlayers.filter(p => p.position === "MID");
  const forwards = lineupPlayers.filter(p => p.position === "FWD");

  // Return Formation object
  return {
    sampleTeamData: {
      goalkeeper,
      defenders,
      midfielders,
      forwards
    },
    benchData: bench
  };
}
// Example usage:
// const result = convertToFormation(apiResponse);
// console.log(result.sampleTeam);
// console.log(result.bench);
