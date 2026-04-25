
import { Request, Response } from 'express';
import { google } from 'googleapis';
import path from 'path';
import { Player, IPlayer } from '../models/Player';
import { FantasyTeam, IFantasyTeam } from '../models/FantasyTeam';
import mongoose from 'mongoose';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const SHEET_ID = '1bUtyUgZuanx5QoB-dWs2J1MZBWppwMjpghKpTVR6XsM';
const RANGE = 'GW Data!A1:AE'; // Fetch enough columns

export class SyncController {
    static async syncGameWeekData(req: Request, res: Response) {
        try {
            console.log('Starting GW Data Sync...');

            // 1. Authenticate and Fetch Sheet
            const auth = new google.auth.GoogleAuth({
                keyFile: CREDENTIALS_PATH,
                scopes: SCOPES,
            });
            const sheets = google.sheets({ version: 'v4', auth });

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: RANGE,
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: 'No data found in sheet.' });
            }

            // Extract Headers and Data
            const headers = rows[0].map(h => h.trim().toLowerCase());
            const dataRows = rows.slice(1);

            // Helper to get value by header name
            const getValue = (row: any[], headerName: string): string => {
                const index = headers.indexOf(headerName.toLowerCase());
                if (index === -1) return '';
                return row[index] ? row[index].toString().trim() : '';
            };

            // 2. Pre-fetch all Players and Teams for lookup
            const players = await Player.find({});
            const playerMap = new Map<number, IPlayer>(); // SofaScore ID -> Player Doc
            players.forEach(p => playerMap.set(p.id, p));

            const fantasyTeams = await FantasyTeam.find({});
            const fantasyTeamMap = new Map<string, IFantasyTeam>(); // Name -> FT Doc
            fantasyTeams.forEach(t => fantasyTeamMap.set(t.name.trim().toLowerCase(), t));

            console.log(`Loaded ${players.length} players and ${fantasyTeams.length} fantasy teams.`);

            // Data Structures for Processing
            const playerUpdates = new Map<number, { gwMap: Map<number, any>, metadata: any }>(); // PlayerID -> { gwMap, metadata }
            const fantasyTeamHistory = new Map<string, Map<number, any[]>>(); // TeamName -> GW -> List of Picks (Rows)
            let maxGameweek = 0;
            let currentGameweek = -1;

            // 3. Process Rows
            for (const row of dataRows) {
                const gw = parseInt(getValue(row, 'GW'));
                if (isNaN(gw)) continue;

                if (gw > maxGameweek) maxGameweek = gw;
                if (getValue(row, 'isCurrentGW') === 'TRUE' || getValue(row, 'isCurrentGW') === '1') {
                    currentGameweek = gw;
                }

                const playerId = parseInt(getValue(row, 'Player ID'));
                const fantasyTeamName = getValue(row, 'Fantasy Team');

                // --- NEW: Parse Role ---
                const role = getValue(row, 'Role');
                // -----------------------

                const lineupStatus = getValue(row, 'Lineup');

                // Parse Stats
                const stats = {
                    gameweek: gw,
                    totalPoints: parseInt(getValue(row, 'Point')) || 0,
                    xPoints: parseInt(getValue(row, 'XPoint')) || 0, // Multiplier Points (New)
                    appearances: parseInt(getValue(row, 'App')) || 0, // Mapping App -> Appearances
                    goalsScored: parseInt(getValue(row, 'Goal')) || 0,
                    assists: parseInt(getValue(row, 'Assist')) || 0,
                    cleanSheets: parseInt(getValue(row, 'Clean Sheet')) || 0,
                    saves: parseInt(getValue(row, 'Save')) || 0,
                    redCards: parseInt(getValue(row, 'Red Card')) || 0,
                    yellowCards: parseInt(getValue(row, 'Yellow Card')) || 0,
                    penaltiesMissed: parseInt(getValue(row, 'Penalty Miss')) || 0,
                    penaltiesSaved: parseInt(getValue(row, 'Penalty Save')) || 0,
                    price: parseFloat(getValue(row, 'Price')) || 0,
                    teamId: parseInt(getValue(row, 'Club ID')) || 0,
                    clubName: getValue(row, 'Club') // Capture Club Name
                };

                // Store Player Stats (Deduplicate if same player appears for multiple teams)
                if (!isNaN(playerId)) {
                    if (!playerUpdates.has(playerId)) {
                        playerUpdates.set(playerId, {
                            gwMap: new Map(),
                            metadata: {
                                name: getValue(row, 'Player'),
                                position: getValue(row, 'Position'),
                                teamId: stats.teamId,
                                clubName: stats.clubName
                            }
                        });
                    }
                    playerUpdates.get(playerId)?.gwMap.set(gw, stats);
                }

                // Store Fantasy Team Pick
                if (fantasyTeamName) {
                    const normalizedName = fantasyTeamName.trim().toLowerCase();
                    if (!fantasyTeamHistory.has(normalizedName)) {
                        fantasyTeamHistory.set(normalizedName, new Map());
                    }
                    const teamGwMap = fantasyTeamHistory.get(normalizedName)!;
                    if (!teamGwMap.has(gw)) {
                        teamGwMap.set(gw, []);
                    }
                    teamGwMap.get(gw)?.push({
                        playerId,
                        stats,
                        lineupStatus,
                        role, // Store role
                        row // Keep raw row if needed
                    });
                }
            }

            // Fallback: If no row explicitly marked as current, use the max GW found (last row)
            if (currentGameweek === -1) {
                currentGameweek = maxGameweek > 0 ? maxGameweek : 1;
            }

            // 4. Update Players (Prepare Bulk Ops)
            console.log('Preparing Player Bulk Updates...');
            const playerBulkOps: any[] = [];

            for (const [playerId, data] of playerUpdates) {
                let player = playerMap.get(playerId);

                // Construct new player object if doesn't exist (in memory)
                if (!player) {
                    // Map Position String to Element Type
                    const pos = data.metadata.position.trim().toUpperCase();
                    let elementType = 3; // Default MID
                    if (pos === 'GK' || pos === 'GKP') elementType = 1;
                    else if (pos === 'DEF') elementType = 2;
                    else if (pos === 'MID') elementType = 3;
                    else if (pos === 'FWD') elementType = 4;

                    player = new Player({
                        id: playerId,
                        name: data.metadata.name,
                        webName: data.metadata.name,
                        shortName: data.metadata.name,
                        slug: data.metadata.name.toLowerCase().replace(/\s+/g, '-'),
                        teamId: data.metadata.teamId,
                        clubName: data.metadata.clubName,
                        position: pos,
                        elementType: elementType,
                        price: { nowCost: 0, costChangeStart: 0, costChangeEvent: 0 },
                        history: [],
                        stats: {}
                    });
                    playerMap.set(playerId, player); // Add to map for subsequent reference if needed
                }

                // Update metadata for existing (or new) players if changed (e.g. transfers)
                if (data.metadata.clubName && player.clubName !== data.metadata.clubName) {
                    player.clubName = data.metadata.clubName;
                }
                if (data.metadata.teamId && player.teamId !== data.metadata.teamId) {
                    player.teamId = data.metadata.teamId;
                }

                let historyChanged = false;
                const gwMap = data.gwMap;

                for (const [gw, stats] of gwMap) {
                    // Find existing history for this GW
                    const existingIdx = player.history.findIndex(h => h.gameweek === gw);

                    const historyEntry = {
                        gameweek: gw,
                        fixtureId: 0, // Not checking fixtures yet
                        opponentTeamId: 0,
                        wasHome: true, // Default
                        totalPoints: stats.totalPoints,
                        xPoints: stats.xPoints || 0, // Store xPoints in history
                        appearances: stats.appearances,
                        goalsScored: stats.goalsScored,
                        assists: stats.assists,
                        cleanSheets: stats.cleanSheets,
                        saves: stats.saves,
                        redCards: stats.redCards,
                        yellowCards: stats.yellowCards,
                        penaltiesMissed: stats.penaltiesMissed,
                        penaltiesSaved: stats.penaltiesSaved,
                        price: stats.price
                    };

                    if (existingIdx !== -1) {
                        // Update existing
                        Object.assign(player.history[existingIdx], historyEntry);
                    } else {
                        // Add new
                        player.history.push(historyEntry as any);
                    }
                    historyChanged = true;
                }

                // Recalculate Season Stats
                if (historyChanged) {
                    const totalStats = player.history.reduce((acc, h) => ({
                        totalPoints: acc.totalPoints + (h.totalPoints || 0),
                        xPoints: acc.xPoints + (h.xPoints || 0), // Aggregate xPoints
                        appearances: acc.appearances + (h.appearances || 0),
                        goalsScored: acc.goalsScored + (h.goalsScored || 0),
                        assists: acc.assists + (h.assists || 0),
                        cleanSheets: acc.cleanSheets + (h.cleanSheets || 0),
                        goalsConceded: acc.goalsConceded + (h.goalsConceded || 0),
                        ownGoals: acc.ownGoals + (h.ownGoals || 0),
                        penaltiesSaved: acc.penaltiesSaved + (h.penaltiesSaved || 0),
                        penaltiesMissed: acc.penaltiesMissed + (h.penaltiesMissed || 0),
                        yellowCards: acc.yellowCards + (h.yellowCards || 0),
                        redCards: acc.redCards + (h.redCards || 0),
                        saves: acc.saves + (h.saves || 0),
                        bonus: acc.bonus + (h.bonus || 0),
                        bps: acc.bps + (h.bps || 0),
                    }), {
                        totalPoints: 0, xPoints: 0, appearances: 0, goalsScored: 0, assists: 0,
                        cleanSheets: 0, goalsConceded: 0, ownGoals: 0,
                        penaltiesSaved: 0, penaltiesMissed: 0, yellowCards: 0,
                        redCards: 0, saves: 0, bonus: 0, bps: 0
                    });

                    player.stats.totalPoints = totalStats.totalPoints;
                    player.stats.xPoints = totalStats.xPoints;
                    player.stats.appearances = totalStats.appearances;
                    player.stats.goalsScored = totalStats.goalsScored;
                    player.stats.assists = totalStats.assists;
                    player.stats.cleanSheets = totalStats.cleanSheets;
                    player.stats.goalsConceded = totalStats.goalsConceded;
                    player.stats.ownGoals = totalStats.ownGoals;
                    player.stats.penaltiesSaved = totalStats.penaltiesSaved;
                    player.stats.penaltiesMissed = totalStats.penaltiesMissed;
                    player.stats.yellowCards = totalStats.yellowCards;
                    player.stats.redCards = totalStats.redCards;
                    player.stats.saves = totalStats.saves;
                    player.stats.bonus = totalStats.bonus;
                    player.stats.bps = totalStats.bps;

                    // Push to Bulk Write
                    // We use updateOne with upsert to handle both new and existing
                    playerBulkOps.push({
                        updateOne: {
                            filter: { id: player.id },
                            update: {
                                $set: {
                                    name: player.name,
                                    webName: player.webName,
                                    shortName: player.shortName,
                                    slug: player.slug,
                                    teamId: player.teamId,
                                    clubName: player.clubName,
                                    position: player.position,
                                    elementType: player.elementType,
                                    price: player.price,
                                    history: player.history, // Full replace of history array
                                    stats: player.stats
                                },
                                $setOnInsert: {
                                    // Set fields that should only be set on creation if missing
                                }
                            },
                            upsert: true
                        }
                    });
                }
            }

            if (playerBulkOps.length > 0) {
                console.log(`Executing ${playerBulkOps.length} player updates...`);
                await Player.bulkWrite(playerBulkOps);
            }

            // 5. Update Fantasy Teams (Prepare Bulk Ops)
            console.log('Preparing Fantasy Team Bulk Updates...');
            const teamBulkOps: any[] = [];

            for (const [teamName, gwMap] of fantasyTeamHistory) {
                const team = fantasyTeamMap.get(teamName);
                if (!team) {
                    console.warn(`Fantasy Team '${teamName}' not found in DB.`);
                    continue;
                }

                let teamChanged = false;

                // Update Current GW pointer
                if (team.currentGw !== currentGameweek) {
                    team.currentGw = currentGameweek;
                    teamChanged = true;
                }

                for (const [gw, picksData] of gwMap) {
                    // Calculate GW Points
                    const starters = picksData.filter(p => p.lineupStatus.toLowerCase().includes('starting'));
                    const subs = picksData.filter(p => !p.lineupStatus.toLowerCase().includes('starting'));

                    const processedPicks = [
                        ...starters.map((p, i) => ({ ...p, finalPosition: i + 1 })),
                        ...subs.map(p => {
                            const match = p.lineupStatus.toLowerCase().match(/sub\s*(\d+)/);
                            const subNum = match ? parseInt(match[1]) : 1;
                            return { ...p, finalPosition: 11 + subNum };
                        })
                    ];

                    let gwPoints = 0;
                    const picks = processedPicks.map((p) => {
                        const playerDoc = playerMap.get(p.playerId);

                        const isSub = p.lineupStatus.toLowerCase().startsWith('sub');

                        // Use XPoint for Team Calculation
                        if (playerDoc && !isSub) {
                            gwPoints += p.stats.xPoints || 0;
                        }

                        // --- NEW: Parse Role ---
                        const isCaptain = (p.role || '').trim().toUpperCase() === 'CAPTAIN';
                        const isViceCaptain = (p.role || '').trim().toUpperCase() === 'VICE CAPTAIN';
                        // -----------------------

                        return {
                            element: playerDoc ? playerDoc.id : 0, // SofaScore ID (Number)
                            position: p.finalPosition,
                            isCaptain: isCaptain,
                            isViceCaptain: isViceCaptain,
                            multiplier: isCaptain ? 2 : 1,
                            statsSnapshot: {
                                points: p.stats.xPoints, // Snapshot XPoint for this gameweek pick
                                goals: p.stats.goalsScored,
                                assists: p.stats.assists,
                                cleanSheets: p.stats.cleanSheets
                            }
                        };
                    }).filter(p => p.element !== null); // Remove unknown players

                    // Update History (only if NOT current gameweek)
                    if (gw !== currentGameweek) {
                        const existingHistIdx = team.history.findIndex(h => h.gameweek === gw);
                        const historyEntry: any = {
                            gameweek: gw,
                            points: gwPoints,
                            rank: 0,
                            bank: 0,
                            teamValue: 0,
                            picks: picks
                        };

                        if (existingHistIdx !== -1) {
                            team.history[existingHistIdx] = historyEntry;
                        } else {
                            team.history.push(historyEntry);
                        }
                    } else {
                        // Update Current Squad if this IS the current GW
                        team.currentSquad = {
                            picks: picks,
                            activeChip: team.currentSquad?.activeChip || null,
                            gameweek: gw,
                            points: gwPoints
                        };
                    }
                    teamChanged = true;
                }

                if (teamChanged) {
                    teamBulkOps.push({
                        updateOne: {
                            filter: { _id: team._id },
                            update: {
                                $set: {
                                    currentGw: team.currentGw,
                                    history: team.history,
                                    currentSquad: team.currentSquad
                                }
                            }
                        }
                    });
                }
            }

            if (teamBulkOps.length > 0) {
                console.log(`Executing ${teamBulkOps.length} fantasy team updates...`);
                await FantasyTeam.bulkWrite(teamBulkOps);
            }

            res.status(200).json({
                message: 'Sync complete',
                stats: {
                    playersUpdated: playerUpdates.size,
                    teamsUpdated: fantasyTeamHistory.size,
                    currentGameweek
                }
            });

        } catch (error) {
            console.error('Error syncing GW data:', error);
            res.status(500).json({ message: 'Sync failed', error: (error as Error).message });
        }
    }
}
