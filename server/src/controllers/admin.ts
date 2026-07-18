import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { League } from '../models/League';
import { Team } from '../models/Team';
import { Player } from '../models/Player';
import { Fixture } from '../models/Fixture';
import { Gameweek } from '../models/Gameweek';
import { Season } from '../models/Season';
import { ApiConfig } from '../models/ApiConfig';
import { MatchDetails } from '../models/MatchDetails';
import { User } from '../models/User';
import { FantasyTeam } from '../models/FantasyTeam';
import { fetchFixturesByDate } from '../services/apiSports.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PlayerStats } from '../models/PlayerStats';
import { H2HLeague } from '../models/H2HLeague';
import { H2HFixture } from '../models/H2HFixture';
import { fetchSofascoreJSON } from '../utils/sofascoreScraper';
import { calculatePlayerPoints } from '../lib/points';
import { mapSofascoreToPlayerMatchStat } from '../lib/sofascoreMapper';
import { getLeagueAllGWPoints } from './h2h';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getFixtures = async (req: Request, res: Response) => {
    try {
        console.log(req.user.role);
        // Optional: Role check
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const [fixtures, teams, details, gameweeks] = await Promise.all([
            Fixture.find().sort({ startTimestamp: 1 }).lean(),
            Team.find({}, 'id name shortName logo').lean(),
            MatchDetails.find({}, 'fixtureId addedtofantasy').lean(),
            Gameweek.find({}, 'fixtures').lean()
        ]);

        const teamMap = new Map(teams.map((t: any) => [t.id, t]));
        const detailMap = new Map(details.map((d: any) => [d.fixtureId, d]));
        const assignedFixtureIds = new Set(gameweeks.flatMap(gw => gw.fixtures || []));

        const fixturesWithDetailsFlag = fixtures.map(f => {
            const homeTeam = teamMap.get(f.homeTeam?.id ?? -1);
            const awayTeam = teamMap.get(f.awayTeam?.id ?? -1);
            const detail = detailMap.get(f.fixtureId);

            return {
                ...f,
                homeTeamName: homeTeam?.name ?? null,
                homeTeamShortName: homeTeam?.shortName ?? null,
                homeTeamLogo: homeTeam?.logo ?? null,
                awayTeamName: awayTeam?.name ?? null,
                awayTeamShortName: awayTeam?.shortName ?? null,
                awayTeamLogo: awayTeam?.logo ?? null,
                hasDetails: !!detail,
                addedtofantasy: detail?.addedtofantasy ?? false,
                hasGameweek: assignedFixtureIds.has(f.fixtureId)
            };
        });

        res.status(200).json({ data: fixturesWithDetailsFlag });
    } catch (error) {
        console.error('Error fetching admin fixtures:', error);
        res.status(500).json({ error: 'Failed to fetch fixtures' });
    }
};

export const getGameweeks = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const gameweeks = await Gameweek.find().sort({ number: 1 });
        res.status(200).json({ data: gameweeks });
    } catch (error) {
        console.error('Error fetching gameweeks:', error);
        res.status(500).json({ error: 'Failed to fetch gameweeks' });
    }
};

export const getSeasons = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const seasons = await Season.find().sort({ id: -1 });
        res.status(200).json({ data: seasons });
    } catch (error) {
        console.error('Error fetching seasons:', error);
        res.status(500).json({ error: 'Failed to fetch seasons' });
    }
};

export const createGameweek = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { number, fixtures, isCurrent, startDate, endDate, season } = req.body;
        const newGameweek = new Gameweek({
            number,
            fixtures,
            isCurrent,
            startDate,
            endDate,
            season
        });

        await newGameweek.save();
        res.status(201).json({ data: newGameweek });
    } catch (error) {
        console.error('Error creating gameweek:', error);
        res.status(500).json({ error: 'Failed to create gameweek' });
    }
};

export const updateGameweek = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Fetch existing gameweek to compare fixtures
        const existingGameweek = await Gameweek.findById(id);
        if (!existingGameweek) {
            return res.status(404).json({ error: 'Gameweek not found' });
        }

        // Determine if fixtures were removed
        if (updateData.fixtures && Array.isArray(updateData.fixtures)) {
            const oldFixtures = existingGameweek.fixtures || [];
            const newFixtures = updateData.fixtures;
            const removedFixtures = oldFixtures.filter(fId => !newFixtures.includes(fId));

            if (removedFixtures.length > 0) {
                // Remove MatchDetails for removed fixtures
                await MatchDetails.deleteMany({ fixtureId: { $in: removedFixtures } });

                // Fetch players whose stats might be affected
                const affectedPlayers = await PlayerStats.find({ 'gameweeks.fixtureId': { $in: removedFixtures } });

                for (const playerStat of affectedPlayers) {
                    // Filter out removed fixtures
                    playerStat.gameweeks = playerStat.gameweeks.filter(gw => !removedFixtures.includes(gw.fixtureId));
                    // Recalculate total points
                    const total = playerStat.gameweeks.reduce((sum, gw) => sum + (gw.points || 0), 0);
                    playerStat.totalPoints = total;
                    await playerStat.save();
                }
            }
        }

        const updatedGameweek = await Gameweek.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // If it was set to current, trigger the pre-save logic manually since findByIdAndUpdate skips pre-save hooks
        // Or better yet, save the document instead of findByIdAndUpdate
        if (updateData.isCurrent) {
            const gameweek = await Gameweek.findById(id);
            if (gameweek) {
                Object.assign(gameweek, updateData);
                await gameweek.save(); // This triggers the pre-save hook
                return res.status(200).json({ data: gameweek });
            }
        }

        res.status(200).json({ data: updatedGameweek });
    } catch (error) {
        console.error('Error updating gameweek:', error);
        res.status(500).json({ error: 'Failed to update gameweek' });
    }
};

export const updateFixturesFromApi = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        if (!process.env.API_FOOTBALL_KEY) {
            return res.status(500).json({ error: 'API_FOOTBALL_KEY not set' });
        }

        const today = dayjs();
        const datesToFetch = [
            today.subtract(1, 'day').format('YYYY-MM-DD'),
            today.format('YYYY-MM-DD'),
            today.add(1, 'day').format('YYYY-MM-DD')
        ];

        const todayStr = today.tz('Asia/Kolkata').format('YYYY-MM-DD');

        // Check if already updated today
        let apiConfig = await ApiConfig.findOne({ key: 'fixtures_update' });
        if (apiConfig && apiConfig.lastUpdatedString === todayStr) {
            return res.status(200).json({
                success: true,
                message: `Already updated today (${todayStr}). API call skipped to save quota.`
            });
        }

        console.log(`Fetching fixtures for dates: ${datesToFetch.join(', ')}`);

        // Run API requests in parallel
        const responses = await Promise.all(
            datesToFetch.map(date => fetchFixturesByDate(date))
        );

        let savedCount = 0;
        let assignedCount = 0;

        // Get all gameweeks to check for assignments
        const gameweeks = await Gameweek.find();

        for (const data of responses) {
            const apiFixtures = data.response;
            if (!apiFixtures || !Array.isArray(apiFixtures)) continue;

            // Filter for World Cup (league id 1) as requested by user
            const worldCupFixtures = apiFixtures.filter((f: any) => f.league && f.league.id === 1);

            for (const rawFixture of worldCupFixtures) {
                const apiFixture: any = rawFixture;
                const existing = await Fixture.findOne({ fixtureId: apiFixture.id });

                if (existing) {
                    Object.assign(existing, apiFixture);
                    await existing.save();
                    savedCount++;
                } else {
                    await Fixture.create(apiFixture);
                    savedCount++;
                }

                const fixtureStart = dayjs.unix(apiFixture.startTimestamp || 0);

                for (const gw of gameweeks) {
                    const gwStartMs = dayjs(gw.startDate).valueOf();
                    const gwEndMs = dayjs(gw.endDate).endOf('day').valueOf();
                    const fixtureMs = fixtureStart.valueOf();

                    if (fixtureMs >= gwStartMs && fixtureMs <= gwEndMs) {
                        if (!gw.fixtures.includes(apiFixture.fixtureId ?? apiFixture.id)) {
                            gw.fixtures.push(apiFixture.fixtureId ?? apiFixture.id);
                            await gw.save();
                            assignedCount++;
                        }
                        break;
                    }
                }
            }
        }

        // Save ApiConfig to prevent further calls today
        if (!apiConfig) {
            apiConfig = new ApiConfig({ key: 'fixtures_update' });
        }
        apiConfig.lastUpdated = new Date();
        apiConfig.lastUpdatedString = todayStr;
        await apiConfig.save();

        res.status(200).json({
            success: true,
            message: `Updated/Inserted ${savedCount} fixtures and assigned ${assignedCount} fixtures to gameweeks.`
        });

    } catch (error: any) {
        console.error('Error updating fixtures from API:', error.message || error);
        res.status(500).json({ error: error.message || 'Failed to update fixtures from API' });
    }
};

export const getMatchDetails = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const fixtureId = parseInt(req.params.id);
        if (isNaN(fixtureId)) {
            return res.status(400).json({ error: 'Invalid fixture ID' });
        }

        const gw = await Gameweek.findOne({ fixtures: fixtureId });
        if (!gw) {
            return res.status(400).json({ error: 'Cannot add to fantasy. Fixture is not assigned to any gameweek.' });
        }
        const gameweekId = gw.number;

        const matchDetails = await MatchDetails.findOne({ fixtureId });
        if (!matchDetails || !matchDetails.lineups?.length) {
            return res.status(400).json({ error: 'No lineup data available. Run seed:fixtures first.' });
        }

        const incidents = matchDetails.incidents || [];

        let playersProcessed = 0;

        for (const entry of matchDetails.lineups) {
            if (!entry.playerId) continue;

            const stats = mapSofascoreToPlayerMatchStat(entry, incidents);

            const dummyPlayer = { position: entry.position } as any;
            const gwPoints = calculatePlayerPoints(dummyPlayer, stats);

            await PlayerStats.findOneAndUpdate(
                { playerId: entry.playerId },
                { $set: { playerId: entry.playerId } },
                { upsert: true, new: true }
            );

            await PlayerStats.findOneAndUpdate(
                { playerId: entry.playerId },
                { $pull: { gameweeks: { id: gameweekId } } }
            );

            const updatedStats = await PlayerStats.findOneAndUpdate(
                { playerId: entry.playerId },
                { $push: { gameweeks: { id: gameweekId, stats, points: gwPoints, fixtureId } } },
                { new: true }
            );

            if (updatedStats) {
                const total = updatedStats.gameweeks.reduce((sum, gwEntry) => sum + (gwEntry.points || 0), 0);
                updatedStats.totalPoints = total;
                await updatedStats.save();
            }

            playersProcessed++;
        }

        await MatchDetails.findOneAndUpdate(
            { fixtureId },
            { $set: { addedtofantasy: true } }
        );

        res.status(200).json({
            success: true,
            message: `Added to fantasy: ${playersProcessed} players processed for fixture ${fixtureId}`,
        });

    } catch (error: any) {
        console.error('Error adding to fantasy:', error.message || error);
        res.status(500).json({ error: error.message || 'Failed to add to fantasy' });
    }
};

export const getMatchIncidentsAndStats = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const fixtureId = parseInt(req.params.id);
        if (isNaN(fixtureId)) {
            return res.status(400).json({ error: 'Invalid fixture ID' });
        }

        const [fixture, matchDetails, teams] = await Promise.all([
            Fixture.findOne({ fixtureId }).lean(),
            MatchDetails.findOne({ fixtureId }).lean(),
            Team.find({}, 'id name shortName logo').lean(),
        ]);

        if (!fixture) {
            return res.status(404).json({ error: 'Fixture not found' });
        }

        const teamMap = new Map(teams.map((t: any) => [t.id, t]));
        const homeTeam = teamMap.get(fixture.homeTeam?.id ?? -1);
        const awayTeam = teamMap.get(fixture.awayTeam?.id ?? -1);

        const fixtureInfo = {
            ...fixture,
            homeTeamName: homeTeam?.name ?? null,
            homeTeamShortName: homeTeam?.shortName ?? null,
            homeTeamLogo: homeTeam?.logo ?? null,
            awayTeamName: awayTeam?.name ?? null,
            awayTeamShortName: awayTeam?.shortName ?? null,
            awayTeamLogo: awayTeam?.logo ?? null,
        };

        const incidents = matchDetails?.incidents || [];
        const lineups = matchDetails?.lineups || [];
        const players = matchDetails?.players || [];

        const playerIds = lineups.map((l: any) => l.playerId).filter(Boolean);
        const playerStatsDocs = await PlayerStats.find({ playerId: { $in: playerIds } }).lean();
        const playerStatsMap = new Map(playerStatsDocs.map((ps: any) => [ps.playerId, ps]));

        const playerDocs = await Player.find({ id: { $in: playerIds } }, 'id name photo teamId position').lean();
        const playerDocMap = new Map(playerDocs.map((p: any) => [p.id, p]));

        const playerInfo = lineups.map((entry: any) => {
            const statsDoc = playerStatsMap.get(entry.playerId);
            const playerDoc = playerDocMap.get(entry.playerId);
            const gwStat = statsDoc?.gameweeks?.find((gw: any) => gw.fixtureId === fixtureId);

            return {
                playerId: entry.playerId,
                playerName: playerDoc?.name ?? `Player #${entry.playerId}`,
                playerPhoto: playerDoc?.photo ?? null,
                teamId: entry.teamId,
                side: entry.side,
                position: entry.position || playerDoc?.position || 'Unknown',
                lineupStatistics: entry.statistics || {},
                gameweekStats: gwStat?.stats || null,
                gameweekPoints: gwStat?.points ?? null,
            };
        });

        res.status(200).json({
            data: {
                fixture: fixtureInfo,
                incidents,
                playerInfo,
                players,
            },
        });
    } catch (error: any) {
        console.error('Error fetching match incidents and stats:', error.message || error);
        res.status(500).json({ error: error.message || 'Failed to fetch match data' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        // Fetch all users
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getAdminPlayers = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const search = req.query.search as string;
        const excludeTeamId = req.query.excludeTeamId as string;

        const { Player } = require('../models/Player');
        const { Team } = require('../models/Team');
        const { FantasyTeam } = require('../models/FantasyTeam');

        // Find all fantasy teams except the one being edited (if excludeTeamId is provided)
        let ftQuery = {};
        if (excludeTeamId && mongoose.Types.ObjectId.isValid(excludeTeamId)) {
            ftQuery = { _id: { $ne: excludeTeamId } };
        }
        const fantasyTeams = await FantasyTeam.find(ftQuery).lean();

        const takenPlayerIds = new Set<number>();
        for (const ft of fantasyTeams) {
            if (ft.currentSquad && ft.currentSquad.picks) {
                for (const pick of ft.currentSquad.picks) {
                    takenPlayerIds.add(pick.playerId);
                }
            }
        }

        let query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { webName: { $regex: new RegExp(search, 'i') } }
            ];
        }

        // Exclude taken players
        if (takenPlayerIds.size > 0) {
            query.id = { $nin: Array.from(takenPlayerIds) };
        }

        const players = await Player.find(query).lean();
        const teams = await Team.find({}).lean();
        const teamMap = new Map(teams.map((t: any) => [t.id || (t.team && t.team.id), t.name || (t.team && t.team.name)]));

        const mappedPlayers = players.map((p: any) => ({
            id: p.id,
            name: p.name || p.webName || 'Unknown',
            position: p.position || 'Unknown',
            team: teamMap.get(p.teamId) || 'Unknown',
            auctionPrice: p.auctionPrice ?? 0
        }));

        res.status(200).json({ data: mappedPlayers });
    } catch (error) {
        console.error('Error fetching admin players:', error);
        res.status(500).json({ error: 'Failed to fetch admin players' });
    }
};

export const createFantasyTeam = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { name, managers, squad, finance } = req.body;

        if (!name || !managers || managers.length === 0 || !squad || squad.length !== 15) {
            return res.status(400).json({ error: 'Invalid input. Need name, at least one manager, and exactly 15 players in squad.' });
        }

        // Validate squad formation using rules similar to lineupFormatter/substitution
        const positionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
        const startingCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

        for (const player of squad) {
            const p = (player.position || '').toUpperCase();
            let normPos = '';
            if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') normPos = 'GK';
            else if (p === 'DEF' || p === 'DEFENDER' || p === 'D') normPos = 'DEF';
            else if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') normPos = 'MID';
            else if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') normPos = 'FWD';

            if (normPos && positionCounts[normPos as keyof typeof positionCounts] !== undefined) {
                positionCounts[normPos as keyof typeof positionCounts]++;
                if (player.isStarting) {
                    startingCounts[normPos as keyof typeof startingCounts]++;
                }
            }
        }

        if (positionCounts.GK !== 2 || positionCounts.DEF !== 5 || positionCounts.MID !== 5 || positionCounts.FWD !== 3) {
            return res.status(400).json({ error: 'Squad must consist of exactly 2 GK, 5 DEF, 5 MID, 3 FWD' });
        }

        const totalStarting = startingCounts.GK + startingCounts.DEF + startingCounts.MID + startingCounts.FWD;
        if (totalStarting !== 11) {
            return res.status(400).json({ error: 'Exactly 11 players must be selected as starting.' });
        }

        if (startingCounts.GK !== 1 ||
            startingCounts.DEF < 3 || startingCounts.DEF > 5 ||
            startingCounts.MID < 2 || startingCounts.MID > 5 ||
            startingCounts.FWD < 1 || startingCounts.FWD > 3) {
            return res.status(400).json({ error: 'Invalid starting formation.' });
        }

        const picks = squad.map((p: any) => {
            const isCaptain = !!p.isCaptain;
            const isViceCaptain = !!p.isViceCaptain;
            return {
                playerId: p.element, // Player ID
                isCaptain,
                isViceCaptain,
                isStarting: !!p.isStarting,
                subNumber: p.subNumber || 0
            };
        });

        // Ensure exactly one captain and one vice-captain
        const captainCount = picks.filter((p: any) => p.isCaptain).length;
        const vcCount = picks.filter((p: any) => p.isViceCaptain).length;
        if (captainCount !== 1 || vcCount !== 1) {
            return res.status(400).json({ error: 'Must select exactly one Captain and one Vice-Captain.' });
        }

        // Fetch the admin user to get their actual ObjectId for createdBy
        const adminUser = await User.findOne({ username: req.user.userId });
        if (!adminUser) {
            return res.status(404).json({ error: 'Admin user not found.' });
        }

        const newFantasyTeam = new FantasyTeam({
            name,
            managers,
            createdBy: adminUser._id,
            currentSquad: {
                picks
            },
            ...(finance && { finance })
        });

        await newFantasyTeam.save();

        // Update players' auctionPrices
        for (const p of squad) {
            if (p.auctionPrice !== undefined) {
                await Player.updateOne(
                    { id: p.element },
                    { $set: { auctionPrice: Number(p.auctionPrice) } }
                );
            }
        }

        // Update User roles to manager (only for regular users)
        await User.updateMany(
            { _id: { $in: managers }, role: 'user' },
            { $set: { role: 'manager' } }
        );

        res.status(201).json({ data: newFantasyTeam });
    } catch (error) {
        console.error('Error creating fantasy team:', error);
        res.status(500).json({ error: 'Failed to create fantasy team' });
    }
};

export const getFantasyTeams = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        // Fetch all fantasy teams, populate managers and createdBy to show names
        const teams = await FantasyTeam.find()
            .populate('managers', 'username email')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ data: teams });
    } catch (error) {
        console.error('Error fetching fantasy teams:', error);
        res.status(500).json({ error: 'Failed to fetch fantasy teams' });
    }
};

export const getFantasyTeamById = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const team = await FantasyTeam.findById(req.params.id)
            .populate('managers', 'username email')
            .populate('createdBy', 'username')
            .lean();

        if (!team) {
            return res.status(404).json({ error: 'Fantasy team not found.' });
        }

        if (team.currentSquad && team.currentSquad.picks) {
            const playerIds = team.currentSquad.picks.map(p => p.playerId);
            const players = await Player.find({ id: { $in: playerIds } }).lean();

            team.currentSquad.picks = team.currentSquad.picks.map((pick: any) => {
                const player = players.find(p => p.id === pick.playerId);
                return {
                    ...pick,
                    playerId: player ? {
                        id: player.id,
                        webName: player.webName || player.name,
                        name: player.name,
                        position: player.position,
                        teamId: player.teamId
                    } : {
                        id: pick.playerId,
                        webName: 'Unknown Player',
                        name: 'Unknown Player',
                        position: 'Unknown',
                        teamId: 0
                    }
                };
            });
        }

        res.status(200).json({ data: team });
    } catch (error) {
        console.error('Error fetching fantasy team:', error);
        res.status(500).json({ error: 'Failed to fetch fantasy team' });
    }
};

export const updateFantasyTeam = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { name, managers, squad, finance } = req.body;

        if (!name || !managers || !squad || !Array.isArray(squad)) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        if (squad.length !== 15) {
            return res.status(400).json({ error: 'Squad must contain exactly 15 players.' });
        }

        const positionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
        const startingCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

        for (const player of squad) {
            const p = (player.position || '').toUpperCase();
            let normPos = '';
            if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') normPos = 'GK';
            else if (p === 'DEF' || p === 'DEFENDER' || p === 'D') normPos = 'DEF';
            else if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') normPos = 'MID';
            else if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') normPos = 'FWD';

            if (normPos && positionCounts[normPos as keyof typeof positionCounts] !== undefined) {
                positionCounts[normPos as keyof typeof positionCounts]++;
                if (player.isStarting) {
                    startingCounts[normPos as keyof typeof startingCounts]++;
                }
            }
        }

        if (positionCounts.GK !== 2 || positionCounts.DEF !== 5 || positionCounts.MID !== 5 || positionCounts.FWD !== 3) {
            return res.status(400).json({ error: 'Squad must consist of exactly 2 GK, 5 DEF, 5 MID, 3 FWD.' });
        }

        const totalStarting = startingCounts.GK + startingCounts.DEF + startingCounts.MID + startingCounts.FWD;
        if (totalStarting !== 11) {
            return res.status(400).json({ error: 'Exactly 11 players must be selected as starting.' });
        }

        const picks = squad.map((p: any) => {
            const isCaptain = p.isCaptain || false;
            const isViceCaptain = p.isViceCaptain || false;
            return {
                playerId: p.element,
                isCaptain,
                isViceCaptain,
                isStarting: !!p.isStarting,
                subNumber: p.subNumber || 0
            };
        });

        const captainCount = picks.filter((p: any) => p.isCaptain).length;
        const vcCount = picks.filter((p: any) => p.isViceCaptain).length;
        if (captainCount !== 1 || vcCount !== 1) {
            return res.status(400).json({ error: 'Must select exactly one Captain and one Vice-Captain.' });
        }

        const team = await FantasyTeam.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Fantasy team not found.' });
        }

        team.name = name;
        team.managers = managers;
        if (!team.currentSquad) {
            team.currentSquad = { picks: [] };
        }
        team.currentSquad.picks = picks;
        if (finance) {
            if (!team.finance) {
                team.finance = { totalBudget: 1000, utilisation: 0, balance: 1000 };
            }
            team.finance.totalBudget = finance.totalBudget;
            team.finance.utilisation = finance.utilisation;
        }

        await team.save();

        // Update players' auctionPrices
        for (const p of squad) {
            if (p.auctionPrice !== undefined) {
                await Player.updateOne(
                    { id: p.element },
                    { $set: { auctionPrice: Number(p.auctionPrice) } }
                );
            }
        }

        // Update User roles to manager (only for regular users)
        await User.updateMany(
            { _id: { $in: managers }, role: 'user' },
            { $set: { role: 'manager' } }
        );

        res.status(200).json({ data: team });
    } catch (error) {
        console.error('Error updating fantasy team:', error);
        res.status(500).json({ error: 'Failed to update fantasy team' });
    }
};

export const completeGameweek = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { id } = req.params;
        const gameweek = await Gameweek.findById(id);
        if (!gameweek) {
            return res.status(404).json({ error: 'Gameweek not found' });
        }

        if (gameweek.isCompleted) {
            return res.status(400).json({ error: 'Gameweek already completed' });
        }

        // Fetch PlayerStats for all players for this gameweek
        const allPlayerStats = await PlayerStats.find({
            'gameweeks.id': gameweek.number
        }).lean();

        // Create a map for quick lookup of minutes played
        const minutesMap = new Map<number, number>();
        for (const ps of allPlayerStats) {
            const gwData = ps.gameweeks.find(gw => gw.id === gameweek.number);
            if (gwData && gwData.stats) {
                minutesMap.set(ps.playerId, gwData.stats.minutesPlayed || 0);
            }
        }

        // Fetch all players for position info
        const { Player } = require('../models/Player');
        const players = await Player.find().lean();
        const pMap = new Map<number, any>(players.map((p: any) => [p.id, p]));

        const resolvePosition = (posStr: string) => {
            const p = (posStr || '').toUpperCase();
            if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') return 'GK';
            if (p === 'DEF' || p === 'DEFENDER' || p === 'D') return 'DEF';
            if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') return 'MID';
            if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') return 'FWD';
            return 'UNK';
        };

        const fantasyTeams = await FantasyTeam.find();

        for (const team of fantasyTeams) {
            if (!team.currentSquad || !team.currentSquad.picks || team.currentSquad.picks.length !== 15) {
                continue; // Skip invalid teams
            }

            const rawPicks = team.currentSquad.picks.map(p => (p as any).toObject ? (p as any).toObject() : p);
            const preAutoSubPicks = JSON.parse(JSON.stringify(rawPicks));
            let picks = JSON.parse(JSON.stringify(rawPicks));

            // Auto-subs logic
            const starters = picks.filter((p: any) => p.isStarting);
            const bench = picks.filter((p: any) => !p.isStarting).sort((a: any, b: any) => (a.subNumber || 0) - (b.subNumber || 0));

            // Helper to get position of a pick
            const getPos = (pick: any) => resolvePosition(pMap.get(pick.playerId)?.position);

            for (const starter of starters) {
                const starterMins = minutesMap.get(starter.playerId) || 0;
                if (starterMins === 0) {
                    const starterPos = getPos(starter);

                    if (starterPos === 'GK') {
                        // Can only sub with bench GK
                        const benchGk = bench.find((b: any) => getPos(b) === 'GK');
                        if (benchGk && (minutesMap.get(benchGk.playerId) || 0) > 0) {
                            // Swap
                            starter.isStarting = false;
                            starter.subNumber = benchGk.subNumber;
                            benchGk.isStarting = true;
                            benchGk.subNumber = 0;
                        }
                    } else {
                        // Outfield player
                        for (const sub of bench) {
                            if (sub.isStarting || getPos(sub) === 'GK') continue; // already subbed in or is GK

                            if ((minutesMap.get(sub.playerId) || 0) > 0) {
                                // Check if formation remains valid if we swap starter and sub
                                // Calculate formation WITHOUT the starter, WITH the sub
                                const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
                                for (const p of picks) {
                                    if (p.isStarting && p.playerId !== starter.playerId) {
                                        counts[getPos(p) as keyof typeof counts]++;
                                    }
                                }
                                counts[getPos(sub) as keyof typeof counts]++; // Add sub

                                if (counts.DEF >= 3 && counts.DEF <= 5 &&
                                    counts.MID >= 2 && counts.MID <= 5 &&
                                    counts.FWD >= 1 && counts.FWD <= 3) {

                                    // Swap
                                    starter.isStarting = false;
                                    starter.subNumber = sub.subNumber;
                                    sub.isStarting = true;
                                    sub.subNumber = 0;
                                    break; // Found a valid sub for this starter, move to next starter
                                }
                            }
                        }
                    }
                }
            }

            // Push to history
            if (!team.history) team.history = [];

            // Clean up subNumber for starters (should be 0)
            picks.forEach((p: any) => {
                if (p.isStarting) p.subNumber = 0;
            });

            team.history.push({
                gameweek: gameweek.number,
                picks: picks,
                preAutoSubPicks: preAutoSubPicks
            });

            team.currentSquad.picks = picks;
            await team.save();
        }

        gameweek.isCompleted = true;
        gameweek.isCurrent = false; // Usually it's no longer current
        await gameweek.save();

        // Update the next gameweek to be the current one
        const nextGameweek = await Gameweek.findOne({ number: gameweek.number + 1 });
        if (nextGameweek) {
            nextGameweek.isCurrent = true;
            nextGameweek.isNext = false;
            await nextGameweek.save();

            // Set the one after next to be the new next
            const futureGameweek = await Gameweek.findOne({ number: gameweek.number + 2 });
            if (futureGameweek) {
                futureGameweek.isNext = true;
                await futureGameweek.save();
            }
        }

        // Enable pick team
        let apiConfig = await ApiConfig.findOne({ key: 'pick_team_enabled' });
        if (!apiConfig) {
            apiConfig = new ApiConfig({ key: 'pick_team_enabled', lastUpdatedString: 'true', lastUpdated: new Date() });
        } else {
            apiConfig.lastUpdatedString = 'true';
            apiConfig.lastUpdated = new Date();
        }
        await apiConfig.save();

        res.status(200).json({ success: true, message: 'Gameweek completed successfully. Pick team enabled.' });

    } catch (error: any) {
        console.error('Error completing gameweek:', error);
        res.status(500).json({ error: 'Failed to complete gameweek' });
    }
};

export const revertGameweek = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { id } = req.params;
        const Gameweek = (await import("../models/Gameweek")).Gameweek;

        const gameweek = await Gameweek.findById(id);
        if (!gameweek) {
            return res.status(404).json({ error: 'Gameweek not found' });
        }

        if (!gameweek.isCompleted) {
            return res.status(400).json({ error: 'Only completed gameweeks can be reverted' });
        }

        // Check if this is the most recently completed gameweek
        const laterCompleted = await Gameweek.findOne({ number: { $gt: gameweek.number }, isCompleted: true });
        if (laterCompleted) {
            return res.status(400).json({ error: 'You must revert gameweeks in reverse chronological order' });
        }

        // 1. Rollback Gameweek flags
        gameweek.isCompleted = false;
        gameweek.isCurrent = true;
        await gameweek.save();

        // 2. Adjust next gameweeks
        const nextGameweek = await Gameweek.findOne({ number: gameweek.number + 1 });
        if (nextGameweek) {
            nextGameweek.isCurrent = false;
            nextGameweek.isNext = true;
            await nextGameweek.save();

            const futureGameweek = await Gameweek.findOne({ number: gameweek.number + 2 });
            if (futureGameweek) {
                futureGameweek.isNext = false;
                await futureGameweek.save();
            }
        }

        // 3. Remove history entry from all FantasyTeams and restore preAutoSubPicks if available
        const FantasyTeam = (await import("../models/FantasyTeam")).FantasyTeam;
        const teams = await FantasyTeam.find({ 'history.gameweek': gameweek.number });

        for (const team of teams) {
            const gwHistory = team.history.find((h: any) => h.gameweek === gameweek.number);
            if (gwHistory && gwHistory.preAutoSubPicks && gwHistory.preAutoSubPicks.length > 0) {
                team.currentSquad.picks = gwHistory.preAutoSubPicks;
            }
            team.history = team.history.filter((h: any) => h.gameweek !== gameweek.number) as any;
            await team.save();
        }

        res.status(200).json({ success: true, message: 'Gameweek reverted successfully' });

    } catch (error: any) {
        console.error('Error reverting gameweek:', error);
        res.status(500).json({ error: 'Failed to revert gameweek' });
    }
};

export const togglePickTeam = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { enabled, deadlineDate } = req.body; // boolean

        let apiConfig = await ApiConfig.findOne({ key: 'pick_team_enabled' });
        if (!apiConfig) {
            apiConfig = new ApiConfig({
                key: 'pick_team_enabled',
                lastUpdatedString: String(enabled),
                lastUpdated: new Date(),
                deadlineDate: deadlineDate ? new Date(deadlineDate) : undefined
            });
        } else {
            apiConfig.lastUpdatedString = String(enabled);
            apiConfig.lastUpdated = new Date();
            if (deadlineDate !== undefined) {
                apiConfig.deadlineDate = deadlineDate ? new Date(deadlineDate) : undefined;
            }
        }
        await apiConfig.save();

        res.status(200).json({ success: true, data: { enabled: apiConfig.lastUpdatedString === 'true', deadlineDate: apiConfig.deadlineDate } });
    } catch (error: any) {
        console.error('Error toggling pick team:', error);
        res.status(500).json({ error: 'Failed to toggle pick team' });
    }
};

export const getPickTeamStatus = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const apiConfig = await ApiConfig.findOne({ key: 'pick_team_enabled' });
        const enabled = apiConfig ? apiConfig.lastUpdatedString === 'true' : false;

        res.status(200).json({ success: true, data: { enabled, deadlineDate: apiConfig?.deadlineDate } });
    } catch (error: any) {
        console.error('Error fetching pick team status:', error);
        res.status(500).json({ error: 'Failed to fetch pick team status' });
    }
};

export const getLeagues = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const leagues = await League.find({}).lean();
        res.status(200).json({ data: leagues });
    } catch (error) {
        console.error('Error fetching leagues:', error);
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
};

export const fetchLeagueRounds = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const league = await League.findById(req.params.id).lean();
        if (!league) {
            return res.status(404).json({ error: 'League not found' });
        }

        const leagueId = (league as any).leagueId;
        const seasonId = (league as any).leagueSeasonId;

        if (!leagueId || !seasonId) {
            return res.status(400).json({ error: 'League has no external leagueId or leagueSeasonId configured' });
        }

        const url = `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/rounds`;
        const data = await fetchSofascoreJSON(url);

        const rounds: number[] = data.rounds?.map((r: any) => r.round) || [];
        const currentRound = data.currentRound?.round ?? null;

        // Save totalRounds to league
        await League.findByIdAndUpdate(req.params.id, {
            $set: { totalRounds: rounds.length, currentRound }
        });

        res.status(200).json({ data: { rounds, currentRound, totalRounds: rounds.length } });
    } catch (error: any) {
        console.error('Error fetching league rounds:', error);
        res.status(500).json({ error: `Failed to fetch rounds: ${error.message}` });
    }
};

export const updateLeague = async (req: Request, res: Response) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { currentRound, totalRounds } = req.body;
        const updateData: Record<string, any> = {};

        if (currentRound !== undefined) updateData.currentRound = currentRound;
        if (totalRounds !== undefined) updateData.totalRounds = totalRounds;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const league = await League.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!league) {
            return res.status(404).json({ error: 'League not found' });
        }

        res.status(200).json({ data: league });
    } catch (error: any) {
        console.error('Error updating league:', error);
        res.status(500).json({ error: `Failed to update league: ${error.message}` });
    }
};

// --- H2H Admin Controllers ---

export const getH2HLeague = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        // Get the H2H league for the current season (or first one if no season specified)
        const { season } = req.query;
        const query = season ? { season: Number(season) } : {};
        const league = await H2HLeague.findOne(query)
            .populate('fantasyTeams', 'name managers')
            .lean();

        if (!league) {
            return res.json({ data: null });
        }

        // Count fixtures
        const completedGws = await Gameweek.find({ isCompleted: true }).select('number').lean();
        const completedGwNumbers = completedGws.map(g => g.number);

        const total = await H2HFixture.countDocuments({ league: league._id });
        const completed = await H2HFixture.countDocuments({ league: league._id, gameweek: { $in: completedGwNumbers } });

        res.json({ data: { ...league, fixtureCount: total, completedFixtures: completed } });
    } catch (error: any) {
        console.error('Error getting H2H league:', error);
        res.status(500).json({ error: error.message });
    }
};

export const upsertH2HLeague = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { name, fantasyTeamIds, gameweekStart, gameweekEnd, season } = req.body;

        if (!name || !fantasyTeamIds || fantasyTeamIds.length < 2) {
            return res.status(400).json({ error: 'Name and at least 2 fantasy teams required' });
        }

        const seasonNum = season || 1;
        
        // Find existing league for this season
        let league = await H2HLeague.findOne({ season: seasonNum });
        
        if (league) {
            // Update existing
            league.name = name;
            league.fantasyTeams = fantasyTeamIds;
            league.gameweekStart = gameweekStart || 1;
            league.gameweekEnd = gameweekEnd || 38;
            await league.save();
        } else {
            // Create new
            league = await H2HLeague.create({
                name,
                fantasyTeams: fantasyTeamIds,
                gameweekStart: gameweekStart || 1,
                gameweekEnd: gameweekEnd || 38,
                season: seasonNum,
            });
        }

        // Populate before returning
        await league.populate('fantasyTeams', 'name managers');
        
        res.json({ data: league });
    } catch (error: any) {
        console.error('Error upserting H2H league:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteH2HLeague = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { id } = req.params;
        await H2HFixture.deleteMany({ league: id });
        await H2HLeague.findByIdAndDelete(id);

        res.json({ message: 'H2H league deleted' });
    } catch (error: any) {
        console.error('Error deleting H2H league:', error);
        res.status(500).json({ error: error.message });
    }
};

export const generateH2HFixtures = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { id } = req.params;
        const league = await H2HLeague.findById(id);
        if (!league) return res.status(404).json({ error: 'H2H league not found' });

        // Delete existing fixtures for this league to allow regeneration
        await H2HFixture.deleteMany({ league: id });

        const teamIds = league.fantasyTeams.map(t => t.toString());
        const numTeams = teamIds.length;
        const gwStart = league.gameweekStart;
        const gwEnd = league.gameweekEnd;

        // Circle method for round-robin
        // If odd number of teams, add a "bye" placeholder
        const teams = [...teamIds];
        if (numTeams % 2 !== 0) {
            teams.push('bye');
        }

        const n = teams.length; // always even now
        const rounds = n - 1;   // number of rounds per leg

        const fixtureDocs: any[] = [];

        // Generate first leg fixtures
        for (let round = 0; round < rounds; round++) {
            const gw = gwStart + round;
            if (gw > gwEnd) break;

            const roundFixtures = getRoundPairings(teams, round, n);
            for (const [home, away] of roundFixtures) {
                if (home === 'bye' || away === 'bye') continue;
                fixtureDocs.push({
                    league: id,
                    homeTeam: home,
                    awayTeam: away,
                    gameweek: gw,
                });
            }
        }

        // Generate second leg (reversed home/away, offset by first leg rounds)
        for (let round = 0; round < rounds; round++) {
            const gw = gwStart + rounds + round;
            if (gw > gwEnd) break;

            const roundFixtures = getRoundPairings(teams, round, n);
            for (const [home, away] of roundFixtures) {
                if (home === 'bye' || away === 'bye') continue;
                fixtureDocs.push({
                    league: id,
                    homeTeam: away, // reversed
                    awayTeam: home,
                    gameweek: gw,
                });
            }
        }

const created = await H2HFixture.insertMany(fixtureDocs);

        const gameweeks = Array.from(new Set(created.map((f: any) => f.gameweek))).sort((a: number, b: number) => a - b);

        res.json({
            data: {
                leagueId: id,
                fixturesCreated: created.length,
                gameweeks,
            },
        });
    } catch (error: any) {
        console.error('Error generating H2H fixtures:', error);
        res.status(500).json({ error: error.message });
    }
};

// Circle method pairings for a given round
function getRoundPairings(teams: string[], round: number, n: number): [string, string][] {
    const fixed = teams[0];
    const rotating = teams.slice(1);
    const pairings: [string, string][] = [];

    // Rotate the rotating array: move last element to position (round) from end
    const rotated = [...rotating];
    for (let i = 0; i < round; i++) {
        rotated.unshift(rotated.pop()!);
    }

    // Pair fixed team with first rotating team
    pairings.push([fixed, rotated[0]]);

    // Pair remaining: second with second-to-last, etc.
    for (let i = 1; i < n / 2; i++) {
        pairings.push([rotated[i], rotated[n - 2 - i]]);
    }

    return pairings;
}

export const getH2HLeagueFixtures = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { id } = req.params;
        const league = await H2HLeague.findById(id).lean();
        if (!league) return res.status(404).json({ error: 'H2H league not found' });

        const fixtures = await H2HFixture.find({ league: id })
            .populate('homeTeam', 'name')
            .populate('awayTeam', 'name')
            .sort({ gameweek: 1 })
            .lean();

        // Enrich fixtures with live scores for completed GWs
        const gwPointsMap = await getLeagueAllGWPoints(league);

        const enrichedFixtures = fixtures.map(fix => {
            const gwPoints = gwPointsMap.get(fix.gameweek);
            if (gwPoints) {
                const homeScore = gwPoints.get(fix.homeTeam._id.toString()) ?? 0;
                const awayScore = gwPoints.get(fix.awayTeam._id.toString()) ?? 0;
                let winner: string | 'draw' | null = null;
                if (homeScore > awayScore) winner = fix.homeTeam._id.toString();
                else if (awayScore > homeScore) winner = fix.awayTeam._id.toString();
                else winner = 'draw';

                return {
                    ...fix,
                    homeScore,
                    awayScore,
                    status: 'completed',
                    winner,
                };
            }
            return fix;
        });

        // Group by gameweek
        const byGameweek: Record<number, any[]> = {};
        for (const f of enrichedFixtures) {
            const gw = f.gameweek;
            if (!byGameweek[gw]) byGameweek[gw] = [];
            byGameweek[gw].push(f);
        }

        res.json({ data: { fixtures: enrichedFixtures, byGameweek } });
    } catch (error: any) {
        console.error('Error getting H2H fixtures:', error);
        res.status(500).json({ error: error.message });
    }
};
