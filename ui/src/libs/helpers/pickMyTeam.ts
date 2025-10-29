/**
 * Swaps a player between starting lineup and bench while maintaining FPL formation rules
 * @param {Object} teamData - The team data object containing starting and bench players
 * @param {number} playerId - ID of the player to swap
 * @param {string} location - Current location: 'starting' or 'bench'
 * @returns {Object} - Updated team data and available swap options
 */
function handlePlayerSwap(teamData, playerId, location) {
    const FORMATION_RULES = {
        goalkeeper: { min: 1, max: 1 },
        defenders: { min: 3, max: 5 },
        midfielders: { min: 2, max: 5 },
        forwards: { min: 1, max: 3 }
    };

    // Helper function to count players by position in starting lineup
    function countStartingPlayers() {
        return {
            goalkeeper: teamData.starting.goalkeeper.length,
            defenders: teamData.starting.defenders.length,
            midfielders: teamData.starting.midfielders.length,
            forwards: teamData.starting.forwards.length
        };
    }

    // Helper function to get position category from position code
    function getPositionCategory(position) {
        const positionMap = {
            'GK': 'goalkeeper',
            'DEF': 'defenders',
            'MID': 'midfielders',
            'FWD': 'forwards'
        };
        return positionMap[position];
    }

    // Find the selected player
    let selectedPlayer = null;
    let selectedPlayerCategory = null;

    if (location === 'starting') {
        // Search in starting lineup
        for (let category in teamData.starting) {
            const player = teamData.starting[category].find(p => p.id === playerId);
            if (player) {
                selectedPlayer = player;
                selectedPlayerCategory = category;
                break;
            }
        }
    } else {
        // Search in bench
        selectedPlayer = teamData.bench.find(p => p.id === playerId);
        if (selectedPlayer) {
            selectedPlayerCategory = getPositionCategory(selectedPlayer.position);
        }
    }

    if (!selectedPlayer) {
        return { error: 'Player not found' };
    }

    // Get current formation counts
    const currentCounts = countStartingPlayers();

    // Determine available players for swap
    let availablePlayers = [];

    if (location === 'starting') {
        // Moving from starting to bench - find bench players that can replace
        availablePlayers = teamData.bench.filter(benchPlayer => {
            const benchCategory = getPositionCategory(benchPlayer.position);
            
            // Create hypothetical counts after swap
            const hypotheticalCounts = { ...currentCounts };
            hypotheticalCounts[selectedPlayerCategory]--;
            hypotheticalCounts[benchCategory]++;

            // Check if swap maintains valid formation
            return (
                hypotheticalCounts.goalkeeper >= FORMATION_RULES.goalkeeper.min &&
                hypotheticalCounts.goalkeeper <= FORMATION_RULES.goalkeeper.max &&
                hypotheticalCounts.defenders >= FORMATION_RULES.defenders.min &&
                hypotheticalCounts.defenders <= FORMATION_RULES.defenders.max &&
                hypotheticalCounts.midfielders >= FORMATION_RULES.midfielders.min &&
                hypotheticalCounts.midfielders <= FORMATION_RULES.midfielders.max &&
                hypotheticalCounts.forwards >= FORMATION_RULES.forwards.min &&
                hypotheticalCounts.forwards <= FORMATION_RULES.forwards.max
            );
        });
    } else {
        // Moving from bench to starting - find starting players that can be benched
        for (let category in teamData.starting) {
            const categoryPlayers = teamData.starting[category].filter(startingPlayer => {
                const startingCategory = category;
                
                // Create hypothetical counts after swap
                const hypotheticalCounts = { ...currentCounts };
                hypotheticalCounts[startingCategory]--;
                hypotheticalCounts[selectedPlayerCategory]++;

                // Check if swap maintains valid formation
                return (
                    hypotheticalCounts.goalkeeper >= FORMATION_RULES.goalkeeper.min &&
                    hypotheticalCounts.goalkeeper <= FORMATION_RULES.goalkeeper.max &&
                    hypotheticalCounts.defenders >= FORMATION_RULES.defenders.min &&
                    hypotheticalCounts.defenders <= FORMATION_RULES.defenders.max &&
                    hypotheticalCounts.midfielders >= FORMATION_RULES.midfielders.min &&
                    hypotheticalCounts.midfielders <= FORMATION_RULES.midfielders.max &&
                    hypotheticalCounts.forwards >= FORMATION_RULES.forwards.min &&
                    hypotheticalCounts.forwards <= FORMATION_RULES.forwards.max
                );
            });
            availablePlayers.push(...categoryPlayers);
        }
    }

    return {
        selectedPlayer,
        location,
        availablePlayers,
        currentFormation: `${currentCounts.defenders}-${currentCounts.midfielders}-${currentCounts.forwards}`
    };
}

/**
 * Executes the swap between two players
 * @param {Object} teamData - The team data object
 * @param {number} player1Id - First player ID
 * @param {number} player2Id - Second player ID
 * @returns {Object} - Updated team data
 */
function executeSwap(teamData, player1Id, player2Id) {
    const newTeamData = JSON.parse(JSON.stringify(teamData)); // Deep clone
    
    let player1 = null, player1Location = null, player1Category = null;
    let player2 = null, player2Location = null, player2Category = null;

    // Find player 1
    for (let category in newTeamData.starting) {
        const idx = newTeamData.starting[category].findIndex(p => p.id === player1Id);
        if (idx !== -1) {
            player1 = newTeamData.starting[category][idx];
            player1Location = 'starting';
            player1Category = category;
            newTeamData.starting[category].splice(idx, 1);
            break;
        }
    }
    if (!player1) {
        const idx = newTeamData.bench.findIndex(p => p.id === player1Id);
        if (idx !== -1) {
            player1 = newTeamData.bench[idx];
            player1Location = 'bench';
            newTeamData.bench.splice(idx, 1);
        }
    }

    // Find player 2
    for (let category in newTeamData.starting) {
        const idx = newTeamData.starting[category].findIndex(p => p.id === player2Id);
        if (idx !== -1) {
            player2 = newTeamData.starting[category][idx];
            player2Location = 'starting';
            player2Category = category;
            newTeamData.starting[category].splice(idx, 1);
            break;
        }
    }
    if (!player2) {
        const idx = newTeamData.bench.findIndex(p => p.id === player2Id);
        if (idx !== -1) {
            player2 = newTeamData.bench[idx];
            player2Location = 'bench';
            newTeamData.bench.splice(idx, 1);
        }
    }

    // Swap positions
    if (player1Location === 'starting') {
        newTeamData.bench.push(player1);
        delete player1.isCaptain;
        delete player1.isViceCaptain;
        delete player1.isPowerPlayer;
    } else {
        const category = player1.position === 'GK' ? 'goalkeeper' : 
                        player1.position === 'DEF' ? 'defenders' :
                        player1.position === 'MID' ? 'midfielders' : 'forwards';
        newTeamData.starting[category].push(player1);
        delete player1.subNumber;
    }

    if (player2Location === 'starting') {
        newTeamData.bench.push(player2);
        delete player2.isCaptain;
        delete player2.isViceCaptain;
        delete player2.isPowerPlayer;
    } else {
        const category = player2.position === 'GK' ? 'goalkeeper' : 
                        player2.position === 'DEF' ? 'defenders' :
                        player2.position === 'MID' ? 'midfielders' : 'forwards';
        newTeamData.starting[category].push(player2);
        delete player2.subNumber;
    }

    // Reassign bench sub numbers
    newTeamData.bench.forEach((player, index) => {
        player.subNumber = index + 1;
    });

    return newTeamData;
}

// Example usage:
// Get available swap options when clicking a starting player
const result = handlePlayerSwap(teamData, 10, 'starting'); // Mika Biereth
console.log('Available players to swap with:', result.availablePlayers);

// Execute the swap
const updatedTeam = executeSwap(teamData, 10, 11); // Swap Biereth with Nico Williams
