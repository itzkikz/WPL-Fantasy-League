import { Request, Response } from 'express';
import { User } from '../models/User';
import { FantasyTeam } from '../models/FantasyTeam';
import { H2HLeague } from '../models/H2HLeague';
import { H2HFixture } from '../models/H2HFixture';
import { PlayerStats } from '../models/PlayerStats';
import { Player } from '../models/Player';
import { Gameweek } from '../models/Gameweek';
import { getGameweekPoints, getGameweekMinutes } from './players';

// Helper: compute a single team's GW points from picks + a player-stats lookup map
function computePicksPoints(picks: any[], gameweek: number, statsByPlayerId: Map<number, any>): number {
    if (!picks || !picks.length) return 0;

    // Build minutes map for captain check
    const minutesMap = new Map<number, number>();
    for (const pick of picks) {
        const ps = statsByPlayerId.get(pick.playerId);
        if (ps) minutesMap.set(pick.playerId, getGameweekMinutes(ps.gameweeks, gameweek));
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
        const ps = statsByPlayerId.get(pick.playerId);
        if (!ps) continue;

        let pts = getGameweekPoints(ps.gameweeks, gameweek);
        if (pts === 0) continue;

        if (pick.isCaptain && captainPlayed) {
            pts *= 2;
        } else if (pick.isViceCaptain && !captainPlayed) {
            pts *= 2;
        }
        gwScore += pts;
    }

    return gwScore;
}

// Helper: get points for all completed GWs in league range.
// Batched: loads all league teams + all player stats up front (4 queries total)
// instead of 2 queries per team per gameweek.
export async function getLeagueAllGWPoints(league: any, includeCurrentGw: boolean = false): Promise<Map<number, Map<string, number>>> {
    const gwPoints = new Map<number, Map<string, number>>();
    const completedGws = await Gameweek.find({ isCompleted: true }).select('number').lean();
    const completedGwNumbers = new Set(completedGws.map((g: any) => g.number));

    const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
    const currentGw = currentGwDoc?.number || 0;

    const gwsToCompute: number[] = [];
    for (let gw = league.gameweekStart; gw <= league.gameweekEnd; gw++) {
        if (completedGwNumbers.has(gw) || (includeCurrentGw && gw === currentGw)) {
            gwsToCompute.push(gw);
        }
    }
    if (gwsToCompute.length === 0) return gwPoints;

    const teamIds = league.fantasyTeams.map((t: any) => t._id.toString());

    // Load all league teams in one query (only picks/history fields needed)
    const teams = await FantasyTeam.find({ _id: { $in: teamIds } })
        .select('currentSquad.picks history.gameweek history.picks')
        .lean();

    // Build picks map: gw -> teamId -> picks (currentSquad wins for the current GW)
    const picksByGwByTeam = new Map<number, Map<string, any[]>>();
    for (const team of teams) {
        const teamId = team._id.toString();
        const history = team.history || [];
        for (const h of history) {
            if (!h.picks?.length) continue;
            if (!picksByGwByTeam.has(h.gameweek)) picksByGwByTeam.set(h.gameweek, new Map());
            picksByGwByTeam.get(h.gameweek)!.set(teamId, h.picks);
        }
        if (team.currentSquad?.picks?.length) {
            if (!picksByGwByTeam.has(currentGw)) picksByGwByTeam.set(currentGw, new Map());
            picksByGwByTeam.get(currentGw)!.set(teamId, team.currentSquad.picks);
        }
    }

    // Collect all player ids referenced by any pick
    const allPlayerIds = new Set<number>();
    for (const picksMap of picksByGwByTeam.values()) {
        for (const picks of picksMap.values()) {
            for (const p of picks) allPlayerIds.add(p.playerId);
        }
    }

    // Load all needed player stats in one query
    const allPlayerStats = await PlayerStats.find({
        playerId: { $in: [...allPlayerIds] },
        'gameweeks.id': { $in: gwsToCompute },
    }).lean();

    const statsByPlayerId = new Map<number, any>();
    for (const ps of allPlayerStats) {
        if (!statsByPlayerId.has(ps.playerId)) statsByPlayerId.set(ps.playerId, ps);
    }

    // Compute points per team per GW in memory
    for (const gw of gwsToCompute) {
        const teamPoints = new Map<string, number>();
        const picksMap = picksByGwByTeam.get(gw) || new Map<string, any[]>();
        for (const teamId of teamIds) {
            teamPoints.set(teamId, computePicksPoints(picksMap.get(teamId) || [], gw, statsByPlayerId));
        }
        gwPoints.set(gw, teamPoints);
    }

    return gwPoints;
}

export const getMyH2HLeagues = async (req: Request, res: Response) => {
    try {
        const username = req.user.userId;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { Gameweek } = require('../models/Gameweek');
        const currentGw = await Gameweek.findOne({ isCurrent: true }).lean();

        const fantasyTeam = await FantasyTeam.findOne({ managers: user._id });

        // Find the H2H league for current season (or first one if season not tracked)
        // For now, find the first league containing this team
        let leagues = fantasyTeam
            ? await H2HLeague.find({ fantasyTeams: fantasyTeam._id })
                .populate('fantasyTeams', 'name')
                .lean()
            : [];

        // No team or not in any league -> fall back to the current season's league
        // so users without a fantasy team can still browse H2H
        if (leagues.length === 0) {
            const allLeagues = await H2HLeague.find({})
                .populate('fantasyTeams', 'name')
                .sort({ season: -1, createdAt: -1 })
                .lean();

            let activeLeague = allLeagues[0];
            if (allLeagues.length > 1 && currentGw) {
                activeLeague = allLeagues.find(l => l.gameweekStart <= currentGw.number && l.gameweekEnd >= currentGw.number) || allLeagues[0];
            }

            res.json({ data: activeLeague ? [activeLeague] : [] });
            return;
        }

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
                select: 'name managers managerDisplayNames logo',
                populate: { path: 'managers', select: 'username displayName' }
            })
            .lean();
        if (!league) return res.status(404).json({ error: 'H2H league not found' });

        // Get all fixtures for this league (to know which matchups exist)
        const fixtures = await H2HFixture.find({ league: id }).lean();

        // Compute points for all GWs in range
        const gwPointsMap = await getLeagueAllGWPoints(league);

        // Build standings
        const standings: Record<string, { teamId: string; teamName: string; managerName: string; logo: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }> = {};

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
                logo: t.logo || "",
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
            .populate('fantasyTeams', 'name logo')
            .lean();
        if (!league) return res.status(404).json({ error: 'H2H league not found' });

        const query: any = { league: id };
        if (gameweek) query.gameweek = Number(gameweek);

        const fixtures = await H2HFixture.find(query)
            .populate('homeTeam', 'name')
            .populate('awayTeam', 'name')
            .sort({ gameweek: 1 })
            .lean();

        // Team logos are large base64 strings; embedding them on every fixture
        // (2 per fixture × 220+ fixtures, duplicated again in `byGameweek`)
        // made this endpoint return ~100MB. Send each logo exactly once, keyed
        // by team id, and let the client look it up.
        const teamLogos: Record<string, string> = {};
        for (const t of league.fantasyTeams as any[]) {
            if (t?._id) teamLogos[t._id.toString()] = t.logo || '';
        }

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

        res.json({ data: { fixtures: enrichedFixtures, byGameweek, teamLogos } });
    } catch (error: any) {
        console.error('Error getting H2H fixtures:', error);
        res.status(500).json({ error: error.message });
    }
};