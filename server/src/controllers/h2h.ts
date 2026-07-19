import { Request, Response } from 'express';
import { User } from '../models/User';
import { FantasyTeam } from '../models/FantasyTeam';
import { H2HLeague } from '../models/H2HLeague';
import { H2HFixture } from '../models/H2HFixture';
import { PlayerStats } from '../models/PlayerStats';
import { Player } from '../models/Player';
import { Gameweek } from '../models/Gameweek';

// Helper: compute a fantasy team's GW points from its history picks + player stats
async function computeTeamGWPoints(teamId: string, gameweek: number, currentGw: number): Promise<number> {
    const team = await FantasyTeam.findById(teamId).lean();
    if (!team) return 0;

    // Use currentSquad.picks for the current GW, otherwise use history
    let picks: any[] = [];
    if (gameweek === currentGw && team.currentSquad?.picks?.length) {
        picks = team.currentSquad.picks;
    } else {
        const historyEntry = team.history?.find((h: any) => h.gameweek === gameweek);
        if (!historyEntry || !historyEntry.picks?.length) return 0;
        picks = historyEntry.picks;
    }

    // Get player stats for this GW
    const playerIds = picks.map((p: any) => p.playerId);
    const allPlayerStats = await PlayerStats.find({
        playerId: { $in: playerIds },
        'gameweeks.id': gameweek,
    }).lean();

    // Build minutes map for captain check
    const minutesMap = new Map<number, number>();
    for (const ps of allPlayerStats) {
        const gwData = ps.gameweeks?.find((g: any) => g.id === gameweek);
        if (gwData && gwData.stats) {
            minutesMap.set(ps.playerId, gwData.stats.minutesPlayed || 0);
        }
    }

    // Check if captain played
    const captainPick = picks.find((p: any) => p.isCaptain);
    let captainPlayed = false;
    if (captainPick) {
        captainPlayed = (minutesMap.get(captainPick.playerId) || 0) > 0;
    }

    let gwScore = 0;
    for (const pick of picks) {
        if (!pick.isStarting) continue;
        const ps = allPlayerStats.find((s: any) => s.playerId === pick.playerId);
        if (!ps) continue;
        const gwData = ps.gameweeks?.find((g: any) => g.id === gameweek);
        if (!gwData) continue;

        let pts = gwData.points || 0;
        if (pick.isCaptain && captainPlayed) {
            pts *= 2;
        } else if (pick.isViceCaptain && !captainPlayed) {
            pts *= 2;
        }
        gwScore += pts;
    }

    return gwScore;
}

// Helper: get points for all teams in a league for a specific GW
async function getLeagueGWPoints(league: any, gameweek: number, currentGw: number): Promise<Map<string, number>> {
    const pointsMap = new Map<string, number>();
    const teamIds = league.fantasyTeams.map((t: any) => t._id.toString());

    for (const teamId of teamIds) {
        const pts = await computeTeamGWPoints(teamId, gameweek, currentGw);
        pointsMap.set(teamId, pts);
    }

    return pointsMap;
}

// Helper: get points for all completed GWs in league range
export async function getLeagueAllGWPoints(league: any, includeCurrentGw: boolean = false): Promise<Map<number, Map<string, number>>> {
    const gwPoints = new Map<number, Map<string, number>>();
    const completedGws = await Gameweek.find({ isCompleted: true }).select('number').lean();
    const completedGwNumbers = new Set(completedGws.map((g: any) => g.number));

    const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
    const currentGw = currentGwDoc?.number || 0;

    for (let gw = league.gameweekStart; gw <= league.gameweekEnd; gw++) {
        if (!completedGwNumbers.has(gw) && !(includeCurrentGw && gw === currentGw)) continue;
        const pointsMap = await getLeagueGWPoints(league, gw, currentGw);
        gwPoints.set(gw, pointsMap);
    }

    return gwPoints;
}

export const getMyH2HLeagues = async (req: Request, res: Response) => {
    try {
        const username = req.user.userId;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const fantasyTeam = await FantasyTeam.findOne({ managers: user._id });
        if (!fantasyTeam) return res.status(404).json({ error: 'Fantasy team not found' });

        // Find the H2H league for current season (or first one if season not tracked)
        // For now, find the first league containing this team
        const leagues = await H2HLeague.find({ fantasyTeams: fantasyTeam._id })
            .populate('fantasyTeams', 'name')
            .lean();

        // Get the current gameweek to determine "active" league
        const { Gameweek } = require('../models/Gameweek');
        const currentGw = await Gameweek.findOne({ isCurrent: true }).lean();

        let activeLeague = leagues[0];
        if (leagues.length > 1 && currentGw) {
            activeLeague = leagues.find(l => l.gameweekStart <= currentGw.number && l.gameweekEnd >= currentGw.number) || leagues[0];
        }

        // Return just the active league (one per season)
        res.json({ data: activeLeague ? [activeLeague] : [] });
    } catch (error: any) {
        console.error('Error getting my H2H leagues:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getH2HStandings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const league = await H2HLeague.findById(id)
            .populate({
                path: 'fantasyTeams',
                select: 'name managers managerDisplayNames',
                populate: { path: 'managers', select: 'username displayName' }
            })
            .lean();
        if (!league) return res.status(404).json({ error: 'H2H league not found' });

        // Get all fixtures for this league (to know which matchups exist)
        const fixtures = await H2HFixture.find({ league: id }).lean();

        // Compute points for all GWs in range
        const gwPointsMap = await getLeagueAllGWPoints(league);

        // Build standings
        const standings: Record<string, { teamId: string; teamName: string; managerName: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }> = {};

        for (const team of league.fantasyTeams) {
            const t = team as any;
            // Get manager name from populated managers or fallback to managerDisplayNames
            const managers = (t.managers as any[] || []).map(m => m.displayName || m.username).filter(Boolean);
            const managerName = managers.length > 0 
                ? managers.slice(0, 2).join(', ') 
                : (t.managerDisplayNames || '');
            
            standings[t._id.toString()] = {
                teamId: t._id.toString(),
                teamName: t.name,
                managerName,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gf: 0,
                ga: 0,
                pts: 0,
            };
        }

        // Process each fixture using computed GW points
        for (const fix of fixtures) {
            const gwPoints = gwPointsMap.get(fix.gameweek);
            if (!gwPoints) continue; // GW not completed yet

            const homeId = fix.homeTeam.toString();
            const awayId = fix.awayTeam.toString();

            if (!standings[homeId] || !standings[awayId]) continue;

            const homeScore = gwPoints.get(homeId) ?? 0;
            const awayScore = gwPoints.get(awayId) ?? 0;

            standings[homeId].played++;
            standings[awayId].played++;
            standings[homeId].gf += homeScore;
            standings[homeId].ga += awayScore;
            standings[awayId].gf += awayScore;
            standings[awayId].ga += homeScore;

            if (homeScore > awayScore) {
                standings[homeId].won++;
                standings[awayId].lost++;
                standings[homeId].pts += 3;
            } else if (awayScore > homeScore) {
                standings[awayId].won++;
                standings[homeId].lost++;
                standings[awayId].pts += 3;
            } else {
                standings[homeId].drawn++;
                standings[awayId].drawn++;
                standings[homeId].pts += 1;
                standings[awayId].pts += 1;
            }
        }

        const standingsList = Object.values(standings).sort((a, b) => b.pts - a.pts || b.gf - a.gf);

        res.json({ data: { league, standings: standingsList } });
    } catch (error: any) {
        console.error('Error getting H2H standings:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getH2HLeagueFixturesPublic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { gameweek } = req.query;

        const league = await H2HLeague.findById(id)
            .populate('fantasyTeams', 'name')
            .lean();
        if (!league) return res.status(404).json({ error: 'H2H league not found' });

        const query: any = { league: id };
        if (gameweek) query.gameweek = Number(gameweek);

        const fixtures = await H2HFixture.find(query)
            .populate('homeTeam', 'name')
            .populate('awayTeam', 'name')
            .sort({ gameweek: 1 })
            .lean();

        // Enrich fixtures with live scores for completed and current GWs
        const gwPointsMap = await getLeagueAllGWPoints(league, true);

        const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
        const currentGw = currentGwDoc?.number || 0;

        const enrichedFixtures = fixtures.map(fix => {
            const gwPoints = gwPointsMap.get(fix.gameweek);
            if (gwPoints) {
                const homeScore = gwPoints.get(fix.homeTeam._id.toString()) ?? 0;
                const awayScore = gwPoints.get(fix.awayTeam._id.toString()) ?? 0;
                let winner: string | 'draw' | null = null;
                if (homeScore > awayScore) winner = fix.homeTeam._id.toString();
                else if (awayScore > homeScore) winner = fix.awayTeam._id.toString();
                else if (fix.gameweek < currentGw) winner = 'draw';

                const isLive = fix.gameweek === currentGw;
                return {
                    ...fix,
                    homeScore,
                    awayScore,
                    status: isLive ? 'live' : 'completed',
                    winner: isLive ? null : winner,
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