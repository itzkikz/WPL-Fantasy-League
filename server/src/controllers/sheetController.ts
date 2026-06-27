import { Request, Response } from 'express';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import '../models/League';
import mongoose from 'mongoose';
import { getSheets } from '../lib/store/globals';
import { MatchDetails } from '../models/MatchDetails';

export class SheetController {
    static async updatePlayersLatest(req: Request, res: Response) {
        try {
            console.log('Starting Update Players Latest...');

            const sheets: any = getSheets();
            if (!sheets) {
                return res.status(500).json({ message: 'Google Sheets API not initialized.' });
            }

            const spreadsheetId = process.env.API_DATA_SHEET_ID;
            if (!spreadsheetId) {
                return res.status(500).json({ message: 'API_DATA_SHEET_ID is not defined in environment.' });
            }

            // Fetch all players
            const players = await Player.find({});

            // Fetch all teams
            const teams = (await Team.find({}).lean()) as any[];
            // FIX: Map team by t.team.id because id is nested
            const teamMap = new Map(teams.map(t => [t.team?.id || t.id, t]));

            // Fetch all leagues and build a map of Team Object ID to League Name
            const leagues = await mongoose.model('League').find({}).lean() as any[];
            const teamLeagueMap = new Map<string, string>();
            for (const league of leagues) {
                // Read from participants array based on user's updated League model
                if (league.participants && Array.isArray(league.participants)) {
                    for (const participantId of league.participants) {
                        teamLeagueMap.set(participantId.toString(), league.name);
                    }
                }
            }

            // Format data for sheet based strictly on Player.ts schema + Team/League lookups
            const headers = [
                'ID', 'Name', 'Age', 'Number', 'Position', 'Photo', 'Team ID', 'Team Name', 'League Name'
            ];

            const rows = players.map(p => {
                const teamData = teamMap.get(p.teamId);
                // FIX: Extract name from teamData.team.name
                const teamName = teamData?.team?.name || 'Unknown';
                
                // Lookup league by Team's ObjectId
                const leagueName = teamData && teamLeagueMap.has(teamData._id.toString()) 
                    ? teamLeagueMap.get(teamData._id.toString()) 
                    : 'Unknown';

                return [
                    p.id || '',
                    p.name || '',
                    p.age || '',
                    p.number || '',
                    p.position || '',
                    p.photo || '',
                    p.teamId || '',
                    teamName,
                    leagueName
                ];
            });

            const sheetData = [headers, ...rows];

            // Clear the existing sheet data first to prevent leftover rows
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: 'Players!A:Z',
            });

            // Update with new data
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Players!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: sheetData,
                },
            });

            res.status(200).json({
                message: 'Players sheet updated successfully',
                count: players.length
            });

        } catch (error) {
            console.error('Error updating players sheet:', error);
            res.status(500).json({ message: 'Update failed', error: (error as Error).message });
        }
    }

    static async updateMatchPlayerStats(req: Request, res: Response) {
        try {
            console.log('Starting Update Match Player Stats...');

            const sheets: any = getSheets();
            if (!sheets) {
                return res.status(500).json({ message: 'Google Sheets API not initialized.' });
            }

            const spreadsheetId = process.env.API_DATA_SHEET_ID;
            if (!spreadsheetId) {
                return res.status(500).json({ message: 'API_DATA_SHEET_ID is not defined in environment.' });
            }

            // Fetch all match player stats from MatchDetails
            const matchDetails = await MatchDetails.find({});
            const stats: any[] = [];
            
            for (const match of matchDetails) {
                if (match.players && Array.isArray(match.players)) {
                    for (const teamData of match.players) {
                        if (teamData.players && Array.isArray(teamData.players)) {
                            for (const playerData of teamData.players) {
                                stats.push({
                                    fixtureId: match.fixtureId,
                                    team: teamData.team,
                                    player: playerData.player,
                                    statistics: playerData.statistics
                                });
                            }
                        }
                    }
                }
            }

            const headers = [
                'Fixture ID', 'Team ID', 'Team Name', 'Player ID', 'Player Name',
                'Position', 'Minutes Played', 'Rating', 'Captain', 'Substitute',
                'Goals', 'Assists', 'Conceded', 'Saves',
                'Shots Total', 'Shots On',
                'Passes Total', 'Passes Key', 'Passes Accuracy',
                'Tackles Total', 'Blocks', 'Interceptions',
                'Duels Total', 'Duels Won',
                'Dribbles Attempts', 'Dribbles Success',
                'Fouls Drawn', 'Fouls Committed',
                'Yellow Cards', 'Red Cards',
                'Penalty Won', 'Penalty Scored', 'Penalty Missed', 'Penalty Saved'
            ];

            const rows = stats.map((s: any) => {
                const stat = s.statistics && s.statistics.length > 0 ? s.statistics[0] : {};
                
                return [
                    s.fixtureId || '',
                    s.team?.id || '',
                    s.team?.name || '',
                    s.player?.id || '',
                    s.player?.name || '',
                    stat.games?.position || '',
                    stat.games?.minutes ?? '',
                    stat.games?.rating || '',
                    stat.games?.captain ? 'Yes' : 'No',
                    stat.games?.substitute ? 'Yes' : 'No',
                    stat.goals?.total ?? 0,
                    stat.goals?.assists ?? 0,
                    stat.goals?.conceded ?? 0,
                    stat.goals?.saves ?? 0,
                    stat.shots?.total ?? 0,
                    stat.shots?.on ?? 0,
                    stat.passes?.total ?? 0,
                    stat.passes?.key ?? 0,
                    stat.passes?.accuracy ?? '',
                    stat.tackles?.total ?? 0,
                    stat.tackles?.blocks ?? 0,
                    stat.tackles?.interceptions ?? 0,
                    stat.duels?.total ?? 0,
                    stat.duels?.won ?? 0,
                    stat.dribbles?.attempts ?? 0,
                    stat.dribbles?.success ?? 0,
                    stat.fouls?.drawn ?? 0,
                    stat.fouls?.committed ?? 0,
                    stat.cards?.yellow ?? 0,
                    stat.cards?.red ?? 0,
                    stat.penalty?.won ?? 0,
                    stat.penalty?.scored ?? 0,
                    stat.penalty?.missed ?? 0,
                    stat.penalty?.saved ?? 0
                ];
            });

            const sheetData = [headers, ...rows];

            // Clear the existing sheet data first
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: 'SampleFixtureData!A:AH',
            });

            // Update with new data
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'SampleFixtureData!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: sheetData,
                },
            });

            res.status(200).json({
                message: 'Match Player Stats sheet updated successfully',
                count: stats.length
            });

        } catch (error) {
            console.error('Error updating match player stats sheet:', error);
            res.status(500).json({ message: 'Update failed', error: (error as Error).message });
        }
    }

    static async updateMatchEvents(req: Request, res: Response) {
        try {
            console.log('Starting Update Match Events...');

            const sheets: any = getSheets();
            if (!sheets) {
                return res.status(500).json({ message: 'Google Sheets API not initialized.' });
            }

            const spreadsheetId = process.env.API_DATA_SHEET_ID;
            if (!spreadsheetId) {
                return res.status(500).json({ message: 'API_DATA_SHEET_ID is not defined in environment.' });
            }

            // Fetch all match events from MatchDetails
            const matchDetails = await MatchDetails.find({});
            const events: any[] = [];
            
            for (const match of matchDetails) {
                if (match.events && Array.isArray(match.events)) {
                    for (const event of match.events) {
                        events.push({
                            fixtureId: match.fixtureId,
                            ...event
                        });
                    }
                }
            }

            const headers = [
                'Fixture ID', 'Time Elapsed', 'Time Extra',
                'Team ID', 'Team Name',
                'Player ID', 'Player Name',
                'Assist ID', 'Assist Name',
                'Type', 'Detail', 'Comments'
            ];

            const rows = events.map((e: any) => {
                return [
                    e.fixtureId || '',
                    e.time?.elapsed ?? '',
                    e.time?.extra ?? '',
                    e.team?.id || '',
                    e.team?.name || '',
                    e.player?.id || '',
                    e.player?.name || '',
                    e.assist?.id || '',
                    e.assist?.name || '',
                    e.type || '',
                    e.detail || '',
                    e.comments || ''
                ];
            });

            const sheetData = [headers, ...rows];

            // Clear the existing sheet data first
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: 'MatchEvents!A:L', // A to L for 12 columns
            });

            // Update with new data
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'MatchEvents!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: sheetData,
                },
            });

            res.status(200).json({
                message: 'Match Events sheet updated successfully',
                count: events.length
            });

        } catch (error) {
            console.error('Error updating match events sheet:', error);
            res.status(500).json({ message: 'Update failed', error: (error as Error).message });
        }
    }
}
