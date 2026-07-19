import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import dayjs from "dayjs";
import { FantasyTeam } from "../models/FantasyTeam";
import { TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { validateAndApplySwap } from "../lib/validators/substitution";
import { Substitution } from "../types/manager";
import { FormationResult } from "../lib/formatter/types";
import { setCaptain, setViceCaptain } from "../lib/helpers/roleUpdate";
import { resolvePosition } from "../utils";
import { getStandingsData } from "./standings";
import { ApiConfig } from "../models/ApiConfig";



export const details = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.user.userId;

    // 1. Find the User
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`[Manager Details] User not found: ${username}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Find the FantasyTeam managed by this user
    const fantasyTeam = await FantasyTeam.findOne({
      managers: user._id
    }).populate('managers', 'username');

    if (!fantasyTeam) {
      console.log(`[Manager Details] FantasyTeam not found for user: ${username}`);
      return res.status(404).json({ error: 'Fantasy Team not found' });
    }

    const { finance, currentSquad, history, name: teamName } = fantasyTeam;
    const { totalBudget, utilisation, balance } = finance;

    const managersList = (fantasyTeam.managers as any[]).map(m => m.username);

    // 3. Calculate Stats & Rank using getStandingsData (ensures consistency)
    const standingsData = await getStandingsData();
    const myStanding = standingsData.find(s => s.team_id === fantasyTeam._id.toString());
    const total_point_before_this_gw = myStanding?.total_point_before_this_gw || 0;
    const rank = (myStanding as any)?.rank || 1;
    const total = myStanding?.total || 0;
    const teamsCount = standingsData.length;

    const currentGwScores = standingsData.map(s => s.current_gw || 0);
    const avg = currentGwScores.length > 0 ? (currentGwScores.reduce((a, b) => a + b, 0) / currentGwScores.length).toFixed(2) : "0.00";
    const highest = currentGwScores.length > 0 ? Math.max(...currentGwScores) : 0;

    // 4. Transform Squad to FormationResult
    // Map IPick[] to TeamDetails[] format expected by validatores/formatter
    // We need to map `playerId` back to player details (name, position etc)

    // We need to fetch player details for the current squad
    const Player = (await import("../models/Player")).Player; // Dynamic import to avoid circular dep issues if any, or just import at top
    const playerIds = currentSquad.picks.map(p => p.playerId);
    const playersMap = (await Player.find({ id: { $in: playerIds } }).lean()) as any[];
    const pMap = new Map(playersMap.map(p => [p.id, p]));

    const teamIds = [...new Set(playersMap.map(p => p.teamId))];
    const Team = (await import("../models/Team")).Team;
    const teams = (await Team.find({ id: { $in: teamIds } }).lean()) as any[];
    const teamMap = new Map(teams.map(t => [t.id, t]));

    // Fetch current Gameweek
    const Gameweek = (await import("../models/Gameweek")).Gameweek;
    let currentGwDoc = await Gameweek.findOne({ isCurrent: true });
    if (!currentGwDoc) {
      currentGwDoc = await Gameweek.findOne({ isNext: true });
    }
    const targetGw = currentGwDoc ? currentGwDoc.number : 1;

    // Fetch PlayerStats for points
    const PlayerStats = (await import("../models/PlayerStats")).PlayerStats;
    const playerStatsList = await PlayerStats.find({ playerId: { $in: playerIds } })
      .select('playerId gameweeks.id gameweeks.points gameweeks.stats.minutesPlayed')
      .lean();
    const playerStatsMap = new Map(playerStatsList.map(ps => [ps.playerId, ps]));

    let captainPlayed = false;
    const captainPick = currentSquad.picks.find(p => p.isCaptain);
    if (captainPick) {
      const cPs = playerStatsMap.get(captainPick.playerId);
      if (cPs && cPs.gameweeks) {
        const cGw = cPs.gameweeks.find((g: any) => g.id === targetGw);
        if (cGw && cGw.stats && cGw.stats.minutesPlayed > 0) {
          captainPlayed = true;
        }
      }
    }

    const squadAsTeamDetails: TeamDetails[] = currentSquad.picks.map((pick, index) => {
      const playerDoc = pMap.get(pick.playerId);
      const teamDoc = playerDoc ? teamMap.get(playerDoc.teamId) : null;

      let gwPoints = 0;
      const ps = playerStatsMap.get(pick.playerId);
      if (ps && ps.gameweeks) {
        const gData = ps.gameweeks.find((g: any) => g.id === targetGw);
        if (gData) {
          gwPoints = gData.points || 0;
        }
      }

      if (pick.isCaptain && captainPlayed) {
        gwPoints *= 2;
      } else if (pick.isViceCaptain && !captainPlayed) {
        gwPoints *= 2;
      }

      return {
        // Required fields for Formation/Formatter
        player_id: pick.playerId,
        player_name: playerDoc?.webName || playerDoc?.name || "Unknown",
        team_name: teamName, // Fantasy Team Name
        gw: targetGw,
        point: gwPoints,

        position: resolvePosition(playerDoc?.position || ''),
        price: playerDoc?.price?.nowCost || 0,
        club: teamDoc?.team?.name || "Unknown",

        // Lineup Status construction
        lineup: pick.isStarting ? "Starting XI" : `Sub ${pick.subNumber || 0}`,

        // Role Construction (Expected by Formatter as 'role', not 'type')
        role: pick.isCaptain ? "CAPTAIN" : pick.isViceCaptain ? "VICE CAPTAIN" : null,

        team_short_name: teamDoc?.nameCode || teamDoc?.shortName || "UNK",
        team_color: teamDoc?.teamColors?.primary || "#003399",
        team_text_color: teamDoc?.teamColors?.text || "#ffffff",
        team_logo: teamDoc?.logo || "",
        shirtNumber: playerDoc?.shirtNumber || (playerDoc?.jerseyNumber ? Number(playerDoc.jerseyNumber) : 0),
        photo: playerDoc?.photo || "",
        auctionPrice: playerDoc?.auctionPrice
      } as any; // Casting to any because TeamDetails structure from Sheets had specific loose fields
    });

    const totalGWScore = squadAsTeamDetails.reduce((acc, curr) => {
      if (curr.lineup === "Starting XI") {
        return acc + Number(curr.point || 0);
      }
      return acc;
    }, 0);

    // Using the existing formatter
    const managerTeam: FormationResult = convertToFormation(squadAsTeamDetails);

    const apiConfig = await ApiConfig.findOne({ key: 'pick_team_enabled' });
    const pickMyTeam = apiConfig ? apiConfig.lastUpdatedString === 'true' : false;

    return res.json({
      data: {
        deadline: apiConfig?.deadlineDate || new Date(),
        gw: targetGw,
        pickMyTeam,
        avg,
        highest,
        total,
        total_point_before_this_gw,
        totalGWScore,
        teamsCount: teamsCount,
        rank,
        managerTeam,
        team: teamName,
        utlisation: utilisation,
        total_budget: totalBudget,
        balance,
        managers: managersList
      }
    });

  } catch (error) {
    console.error("Error in details controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const substitution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { substitution, roles } = req.body;
    const username = req.user.userId;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fantasyTeam = await FantasyTeam.findOne({
      managers: user._id
    });

    if (!fantasyTeam) {
      return res.status(404).json({ error: 'Fantasy Team not found' });
    }

    // --- Prepare current squad for transformation ---
    // We need to fetch Player details names to support the `validateAndApplySwap` which uses names
    // Ideally we should refactor `validateAndApplySwap` to use IDs, but to minimize changes:
    const Player = (await import("../models/Player")).Player;
    const Team = (await import("../models/Team")).Team;

    const playerIds = fantasyTeam.currentSquad.picks.map(p => p.playerId);
    const players = (await Player.find({ id: { $in: playerIds } }).lean()) as any[];
    const pMap = new Map(players.map(p => [p.id, p]));
    const pNameMap = new Map(players.map(p => [p.name, p])); // For reverse lookup by name from frontend

    const teamIds = [...new Set(players.map(p => p.teamId))];
    const teams = (await Team.find({ id: { $in: teamIds } }).lean()) as any[];
    const teamMap = new Map(teams.map(t => [t.id, t]));

    // Construct "Formation" object expected by helpers
    // Helper expects { starting: TeamDetails[], bench: TeamDetails[] }
    // TeamDetails needs 'lineup' and 'player_name'
    const teamDetailsList: TeamDetails[] = fantasyTeam.currentSquad.picks.map((pick, index) => {
      const p = pMap.get(pick.playerId);
      const teamDoc = p ? teamMap.get(p.teamId) : null;
      const posIndex = index + 1;
      return {
        player_name: p?.webName || p?.name || "Unknown",
        lineup: pick.isStarting ? "Starting XI" : `Sub ${pick.subNumber || posIndex - 11}`,
        type: pick.isCaptain ? "Captain" : pick.isViceCaptain ? "Vice Captain" : "Player",
        position: resolvePosition(p?.position || ''),
        // Add other mock fields if validators need them
        player_id: pick.playerId,

        team_short_name: teamDoc?.nameCode || teamDoc?.shortName || "UNK",
        team_color: teamDoc?.teamColors?.primary || "#003399",
        team_text_color: teamDoc?.teamColors?.text || "#ffffff",
        shirtNumber: p?.shirtNumber || 0,
        photo: p?.photo || ""
      } as any;
    });

    // Use existing formatter to separate into starting/bench
    const currentFormation = convertToFormation(teamDetailsList);
    let { starting, bench } = currentFormation;

    let swappedData: FormationResult = { starting, bench };

    // 1. Process Substitutions
    if (substitution?.length > 0) {
      for (const val of substitution) {
        if (!val.swapIn || !val.swapOut) {
          continue;
        }
        const inId = Number(val.swapIn.id || val.swapIn.player_id || 0);
        const outId = Number(val.swapOut.id || val.swapOut.player_id || 0);

        const result: any = validateAndApplySwap({ starting: swappedData.starting, bench: swappedData.bench }, inId, outId);
        if (!result.ok) {
          console.error('[Substitution Failed]', result.error, { inId, outId, startOutCat: swappedData.starting, benchInIdx: swappedData.bench.map((p: any) => p.id) });
          return res.status(403).json({ data: { message: result.error || 'Substitution not allowed' } });
        }
        swappedData.starting = result.starting;
        swappedData.bench = result.bench;
      }
    }

    // 2. Process Roles
    if (roles) {
      if (roles.captain) {
        const capId = roles.captain.id || roles.captain.player_id || roles.captain;
        const finalCapId = typeof capId === 'object' ? 0 : parseInt(String(capId));

        const capResult = setCaptain(swappedData, finalCapId);
        if (!('error' in capResult)) {
          swappedData = capResult as any;
        }
      }
      if (roles.vice) {
        const viceId = roles.vice.id || roles.vice.player_id || roles.vice;
        const finalViceId = typeof viceId === 'object' ? 0 : parseInt(String(viceId));

        const viceResult = setViceCaptain(swappedData, finalViceId);
        if (!('error' in viceResult)) {
          swappedData = viceResult as any;
        }
      }
    }

    // 3. Reconstruct Picks from Swapped Data
    const newPicks: any[] = [];

    const startingList = [
      ...swappedData.starting.GK,
      ...swappedData.starting.DEF,
      ...swappedData.starting.MID,
      ...swappedData.starting.FWD
    ];

    const processList = (list: any[], isStarting: boolean) => {
      list.forEach((item, index) => {
        const realPlayer = pNameMap.get(item.name) || players.find(p => p.name === item.name);

        if (realPlayer) {
          newPicks.push({
            playerId: realPlayer.id,
            isCaptain: item.isCaptain || false,
            isViceCaptain: item.isViceCaptain || false,
            isStarting: isStarting,
            subNumber: isStarting ? 0 : (item.subNumber !== undefined ? item.subNumber : index + 1)
          });
        }
      });
    }

    processList(startingList, true);
    processList(swappedData.bench, false);

    // Update FantasyTeam Current Squad
    fantasyTeam.currentSquad.picks = newPicks;

    await fantasyTeam.save();

    res.json({
      data: {
        message: "Team Updated !"
      }
    });

  } catch (error) {
    console.error("Error in substitution controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const myFixtures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.user.userId;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fantasyTeam = await FantasyTeam.findOne({
      managers: user._id
    });

    if (!fantasyTeam) {
      return res.status(404).json({ error: 'Fantasy Team not found' });
    }

    const PlayerModel = (await import("../models/Player")).Player;
    const TeamModel = (await import("../models/Team")).Team;
    const GameweekModel = (await import("../models/Gameweek")).Gameweek;
    const FixtureModel = (await import("../models/Fixture")).Fixture;

    // Get squad player IDs
    const playerIds = fantasyTeam.currentSquad.picks.map(p => p.playerId);
    const squadPlayers = (await PlayerModel.find({ id: { $in: playerIds } }).lean()) as any[];

    // Group players by their real-world team
    const playersByTeam = new Map<number, Array<{ id: number; name: string; position: string; photo?: string }>>();
    for (const p of squadPlayers) {
      const teamId = p.teamId;
      if (!playersByTeam.has(teamId)) {
        playersByTeam.set(teamId, []);
      }
      playersByTeam.get(teamId)!.push({
        id: p.id,
        name: p.webName || p.name || "",
        position: resolvePosition(p.position || ""),
        photo: p.photo || "",
      });
    }

    const squadTeamIds = [...playersByTeam.keys()];

    if (squadTeamIds.length === 0) {
      return res.json({
        success: true,
        data: { gameweek: 0, fixtures: [] }
      });
    }

    // Get current gameweek
    let currentGwDoc = await GameweekModel.findOne({ isCurrent: true });
    if (!currentGwDoc) {
      currentGwDoc = await GameweekModel.findOne({ isNext: true });
    }
    const currentGw = currentGwDoc ? currentGwDoc.number : 1;

    // Get fixtures for current gameweek involving the user's teams
    const fixtureIds = currentGwDoc ? (currentGwDoc.fixtures || []) : [];
    let fixtures: any[] = [];

    if (fixtureIds.length > 0) {
      fixtures = await FixtureModel.find({
        fixtureId: { $in: fixtureIds },
        $or: [
          { 'homeTeam.id': { $in: squadTeamIds } },
          { 'awayTeam.id': { $in: squadTeamIds } },
        ]
      }).sort({ startTimestamp: 1 }).lean() as any[];
    } else {
      fixtures = await FixtureModel.find({
        'roundInfo.round': currentGw,
        $or: [
          { 'homeTeam.id': { $in: squadTeamIds } },
          { 'awayTeam.id': { $in: squadTeamIds } },
        ]
      }).sort({ startTimestamp: 1 }).lean() as any[];
    }

    // Enrich with team data and attach player badges
    const allTeamIds = new Set<number>();
    fixtures.forEach((f: any) => {
      allTeamIds.add(f.homeTeam?.id);
      allTeamIds.add(f.awayTeam?.id);
    });
    const teamDocs = (await TeamModel.find({ id: { $in: [...allTeamIds] } }).lean()) as any[];
    const teamMap = new Map(teamDocs.map((t: any) => [t.id, t]));

    const mappedFixtures = fixtures.map((f: any) => {
      const home = teamMap.get(f.homeTeam?.id);
      const away = teamMap.get(f.awayTeam?.id);
      return {
        fixtureId: f.fixtureId,
        startTimestamp: f.startTimestamp,
        status: f.status,
        homeTeam: {
          id: f.homeTeam?.id,
          name: home?.name || "Unknown",
          shortName: home?.nameCode || "UNK",
          photo: home?.photo || "",
          logo: home?.logo || "",
          color: home?.teamColors?.primary || "#003399",
        },
        awayTeam: {
          id: f.awayTeam?.id,
          name: away?.name || "Unknown",
          shortName: away?.nameCode || "UNK",
          photo: away?.photo || "",
          logo: away?.logo || "",
          color: away?.teamColors?.primary || "#003399",
        },
        homeScore: f.homeScore,
        awayScore: f.awayScore,
        homePlayers: playersByTeam.get(f.homeTeam?.id) || [],
        awayPlayers: playersByTeam.get(f.awayTeam?.id) || [],
      };
    });

    return res.json({
      success: true,
      data: {
        gameweek: currentGw,
        fixtures: mappedFixtures,
      }
    });

  } catch (error) {
    console.error("Error in myFixtures controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.user.userId;

    // 1. Find the User
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Find the FantasyTeam managed by this user
    const fantasyTeam = await FantasyTeam.findOne({
      managers: user._id
    }).populate('managers', 'username');

    if (!fantasyTeam) {
      return res.status(404).json({ error: 'Fantasy Team not found' });
    }

    // Fetch models dynamically
    const PlayerModel = (await import("../models/Player")).Player;
    const TeamModel = (await import("../models/Team")).Team;
    const GameweekModel = (await import("../models/Gameweek")).Gameweek;
    const PlayerStatsModel = (await import("../models/PlayerStats")).PlayerStats;
    const FixtureModel = (await import("../models/Fixture")).Fixture;
    const ApiConfigModel = (await import("../models/ApiConfig")).ApiConfig;

    // Fetch current Gameweek
    let currentGwDoc = await GameweekModel.findOne({ isCurrent: true });
    if (!currentGwDoc) {
      currentGwDoc = await GameweekModel.findOne({ isNext: true });
    }
    const currentGw = currentGwDoc ? currentGwDoc.number : 1;

    // Fetch ApiConfig details
    const apiConfig = await ApiConfigModel.findOne({ key: 'pick_team_enabled' });
    const pickMyTeam = apiConfig ? apiConfig.lastUpdatedString === 'true' : false;
    const deadlineDate = apiConfig?.deadlineDate || currentGwDoc?.endDate || new Date();

    // 3. Standings & League details
    const standingsData = await getStandingsData();
    const myStanding = standingsData.find(s => s.team_id === fantasyTeam._id.toString());
    const total_point_before_this_gw = myStanding?.total_point_before_this_gw || 0;
    const rank = (myStanding as any)?.rank || 1;
    const total = myStanding?.total || 0;
    const currentGwPoints = myStanding?.current_gw || 0;
    const pos_change = myStanding?.pos_change || 0;
    const teamsCount = standingsData.length;

    const currentGwScores = standingsData.map(s => s.current_gw || 0);
    const avg = currentGwScores.length > 0 ? (currentGwScores.reduce((a, b) => a + b, 0) / currentGwScores.length) : 0;
    const highest = currentGwScores.length > 0 ? Math.max(...currentGwScores) : 0;

    // 4. Team Overview & League Stats
    const teamOverview = {
      teamName: fantasyTeam.name,
      managers: (fantasyTeam.managers as any[]).map(m => m.username),
      gameweek: currentGw,
      gwPoints: currentGwPoints,
      totalPoints: total,
      rank: rank,
      transfers: fantasyTeam.currentSquad.picks.length > 0 ? 1 : 0,
      rankChange: pos_change,
    };

    const leagueStats = {
      totalPoints: total,
      overallRank: rank,
      avgPointsPerGW: Number(avg.toFixed(1)),
      highestGW: highest,
      teamValue: (fantasyTeam.finance.utilisation || 0) / 10,
      totalManagers: await User.countDocuments({ role: 'manager' }),
      totalTeams: await FantasyTeam.countDocuments(),
    };

    // 5. Gameweek Progress
    const gameweekProgress = {
      teamSelected: fantasyTeam.currentSquad.picks.length > 0,
      transfersMade: false,
      captainChosen: fantasyTeam.currentSquad.picks.some(p => p.isCaptain),
      teamConfirmed: true,
      deadline: dayjs(deadlineDate).format("dddd, h:mm A"),
      startDate: currentGwDoc?.startDate?.toISOString() || null,
      endDate: currentGwDoc?.endDate?.toISOString() || null,
    };

    // 6. Upcoming Match
    const nextFixture = await FixtureModel.findOne({ 'status.type': 'notstarted' }).sort({ startTimestamp: 1 }).lean();
    let upcomingMatch = {
      homeTeam: "Man City",
      homeTeamShort: "MCI",
      homeTeamLogo: "",
      awayTeam: "Arsenal",
      awayTeamShort: "ARS",
      awayTeamLogo: "",
      kickoffTime: "Saturday, 8:30 PM",
      gameweek: currentGw,
    };

    if (nextFixture) {
      const homeTeamDoc = await TeamModel.findOne({ id: nextFixture.homeTeam.id }).lean();
      const awayTeamDoc = await TeamModel.findOne({ id: nextFixture.awayTeam.id }).lean();
      upcomingMatch = {
        homeTeam: homeTeamDoc?.name || "Home Team",
        homeTeamShort: homeTeamDoc?.nameCode || "HOM",
        homeTeamLogo: homeTeamDoc?.logo || "",
        awayTeam: awayTeamDoc?.name || "Away Team",
        awayTeamShort: awayTeamDoc?.nameCode || "AWA",
        awayTeamLogo: awayTeamDoc?.logo || "",
        kickoffTime: dayjs(nextFixture.startTimestamp * 1000).format("dddd, h:mm A"),
        gameweek: nextFixture.roundInfo?.round || currentGw,
      };
    }

    // 7. Recent Gameweeks
    const allHistoryPicks = fantasyTeam.history.flatMap(h => h.picks);
    const allHistoryPlayerIds = [...new Set(allHistoryPicks.map(p => p.playerId))];
    const historyPlayerStats = await PlayerStatsModel.find({ playerId: { $in: allHistoryPlayerIds } }).lean();
    const historyPsMap = new Map(historyPlayerStats.map(ps => [ps.playerId, ps]));

    const computeHistoryScore = (picks: any[], gwId: number) => {
      let score = 0;
      let captainPlayed = false;

      const captainPick = picks.find(p => p.isCaptain);
      if (captainPick) {
        const cStats = historyPsMap.get(captainPick.playerId);
        if (cStats && cStats.gameweeks) {
          const cGw = cStats.gameweeks.find((g: any) => g.id === gwId);
          if (cGw && cGw.stats && cGw.stats.minutesPlayed > 0) {
            captainPlayed = true;
          }
        }
      }

      picks.forEach(pick => {
        if (!pick.isStarting) return;

        const statsDoc = historyPsMap.get(pick.playerId);
        if (statsDoc && statsDoc.gameweeks) {
          const gwData = statsDoc.gameweeks.find((g: any) => g.id === gwId);
          if (gwData) {
            let pts = gwData.points || 0;

            if (pick.isCaptain && captainPlayed) {
              pts *= 2;
            } else if (pick.isViceCaptain && !captainPlayed) {
              pts *= 2;
            }
            score += pts;
          }
        }
      });
      return score;
    };

    const recentGameweeks = fantasyTeam.history.map(h => ({
      gameweek: h.gameweek,
      points: computeHistoryScore(h.picks, h.gameweek),
    })).sort((a, b) => a.gameweek - b.gameweek);

    if (!fantasyTeam.history.some(h => h.gameweek === currentGw)) {
      recentGameweeks.push({
        gameweek: currentGw,
        points: currentGwPoints,
      });
    }

    // 8. Top Players (This Gameweek) & Best Performers (This Season)
    const allPlayersWithStats = await PlayerStatsModel.find({}).lean();

    // Build playerId → fantasy team name mapping & collect all owned player IDs
    const allFantasyTeams = await FantasyTeam.find({}).lean();
    const playerToFantasyTeam = new Map<number, string>();
    const allOwnedPlayerIds = new Set<number>();
    for (const ft of allFantasyTeams) {
      for (const pick of ft.currentSquad?.picks || []) {
        allOwnedPlayerIds.add(pick.playerId);
        if (!playerToFantasyTeam.has(pick.playerId)) {
          playerToFantasyTeam.set(pick.playerId, ft.name);
        }
      }
    }
    const ownedPlayersWithStats = allPlayersWithStats.filter((s: any) => allOwnedPlayerIds.has(s.playerId));

    // Calculate Top Players for the current gameweek
    const sortedGwStats = [...ownedPlayersWithStats]
      .map(stat => {
        const gw = stat.gameweeks?.find((g: any) => g.id === currentGw);
        return {
          playerId: stat.playerId,
          gwPoints: gw?.points || 0,
        };
      })
      .sort((a, b) => b.gwPoints - a.gwPoints)
      .slice(0, 5);

    const sortedGwPlayerIds = sortedGwStats.map(s => s.playerId);
    const gwPlayersDocs = (await PlayerModel.find({ id: { $in: sortedGwPlayerIds } }).lean()) as any[];
    const gwPDocsMap = new Map(gwPlayersDocs.map(p => [p.id, p]));
    const gwTeamIds = [...new Set(gwPlayersDocs.map(p => p.teamId))];
    const gwTeamsDocs = (await TeamModel.find({ id: { $in: gwTeamIds } }).lean()) as any[];
    const gwTDocsMap = new Map(gwTeamsDocs.map(t => [t.id, t]));

    const topPlayers = sortedGwStats.map((stat, index) => {
      const playerDoc = gwPDocsMap.get(stat.playerId);
      const teamDoc = playerDoc ? gwTDocsMap.get(playerDoc.teamId) : null;
      return {
        rank: index + 1,
        name: playerDoc?.webName || playerDoc?.name || "Unknown",
        team: playerToFantasyTeam.get(stat.playerId) || teamDoc?.nameCode || "UNK",
        teamLogo: teamDoc?.logo || "",
        position: resolvePosition(playerDoc?.position || ""),
        points: stat.gwPoints,
        photo: playerDoc?.photo || (playerDoc?.id ? `https://img.sofascore.com/api/v1/player/${playerDoc.id}/image` : ""),
        ownedBy: 50,
      };
    });

    // Calculate Best Performers for the whole season
    const sortedStats = [...ownedPlayersWithStats].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 5);
    const sortedPlayerIds = sortedStats.map(s => s.playerId);
    const playersDocs = (await PlayerModel.find({ id: { $in: sortedPlayerIds } }).lean()) as any[];
    const pDocsMap = new Map(playersDocs.map(p => [p.id, p]));
    const teamIdsForPlayers = [...new Set(playersDocs.map(p => p.teamId))];
    const teamsDocsForPlayers = (await TeamModel.find({ id: { $in: teamIdsForPlayers } }).lean()) as any[];
    const tDocsMap = new Map(teamsDocsForPlayers.map(t => [t.id, t]));

    const bestPerformers = sortedStats.map((stat, index) => {
      const playerDoc = pDocsMap.get(stat.playerId);
      const teamDoc = playerDoc ? tDocsMap.get(playerDoc.teamId) : null;
      return {
        rank: index + 1,
        name: playerDoc?.webName || playerDoc?.name || "Unknown",
        team: playerToFantasyTeam.get(stat.playerId) || teamDoc?.nameCode || "UNK",
        teamLogo: teamDoc?.logo || "",
        position: resolvePosition(playerDoc?.position || ""),
        points: stat.totalPoints || 0,
        photo: playerDoc?.photo || (playerDoc?.id ? `https://img.sofascore.com/api/v1/player/${playerDoc.id}/image` : ""),
      };
    });

    // 9. Player Spotlight
    let playerSpotlight = {};

    if (sortedStats.length > 0) {
      const topStat = sortedStats[0];
      const topPlayerDoc = pDocsMap.get(topStat.playerId);
      const topTeamDoc = topPlayerDoc ? tDocsMap.get(topPlayerDoc.teamId) : null;
      const currentGwStats = topStat.gameweeks?.find((g: any) => g.id === currentGw);

      const recentGws = (topStat.gameweeks || [])
        .sort((a: any, b: any) => b.id - a.id)
        .slice(0, 5)
        .reverse();

      const gwStats = currentGwStats?.stats || {};

      const fantasyTeamNameForSpotlight = playerToFantasyTeam.get(topStat.playerId) || "";

      playerSpotlight = {
        player: {
          id: topPlayerDoc?.id || 0,
          name: topPlayerDoc?.webName || topPlayerDoc?.name || "Unknown",
          team: fantasyTeamNameForSpotlight || topTeamDoc?.nameCode || "UNK",
          teamColor: topTeamDoc?.teamColors?.primary || "#6CABDD",
          teamLogo: topTeamDoc?.logo || "",
          point: currentGwStats?.points || 0,
          position: resolvePosition(topPlayerDoc?.position || ""),
          isCaptain: false,
          isViceCaptain: false,
          isPowerPlayer: false,
          fullTeamName: fantasyTeamNameForSpotlight || topTeamDoc?.name || "Unknown",
          photo: topPlayerDoc?.photo || "",
        },
        gameweekPoints: currentGwStats?.points || 0,
        gameweekRank: 1,
        selectedBy: 80,
        price: (topPlayerDoc?.price?.nowCost || 0) / 10,
        formHistory: recentGws.map((g: any) => g.points || 0),
        stats: {
          minutesPlayed: gwStats.minutesPlayed || 0,
          goals: gwStats.goals || 0,
          assists: gwStats.goalAssist || 0,
          cleanSheet: gwStats.cleanSheet || 0,
          yellowCards: gwStats.yellowCards || 0,
          redCards: gwStats.redCards || 0,
          penaltyMissed: gwStats.penaltyMissed || 0,
          penaltySaved: gwStats.penaltySaved || 0,
          saves: gwStats.saves || 0,
          tackles: gwStats.totalTackle || 0,
          clearances: gwStats.totalClearance || 0,
          blocks: gwStats.outfielderBlock || 0,
          recovery: gwStats.ballRecovery || 0,
        },
      };
    }

    // 10. Points Breakdown
    const startingPicks = fantasyTeam.currentSquad.picks.filter(p => p.isStarting);
    const startingPlayerIds = startingPicks.map(p => p.playerId);
    const startingStatsDocs = await PlayerStatsModel.find({ playerId: { $in: startingPlayerIds } }).lean();
    const startingStatsMap = new Map(startingStatsDocs.map(s => [s.playerId, s]));
    const startingPlayerDocs = await PlayerModel.find({ id: { $in: startingPlayerIds } }).lean();
    const startingPlayerPositionMap = new Map(startingPlayerDocs.map((p: any) => [p.id, resolvePosition(p.position || '')]));

    let bdGoalsPoints = 0, bdAssistsPoints = 0, bdCleanSheetPoints = 0;
    let bdYellowPoints = 0, bdRedPoints = 0, bdPenMissPoints = 0, bdPenSavePoints = 0;
    let bdSavesPoints = 0, bdMinutes = 0, bdAppearancePoints = 0, bdDefensivePoints = 0;

    for (const pick of startingPicks) {
      const statsDoc = startingStatsMap.get(pick.playerId);
      if (!statsDoc || !statsDoc.gameweeks) continue;
      const gwData = statsDoc.gameweeks.find((g: any) => g.id === currentGw);
      if (!gwData) continue;
      const s = gwData.stats || {};
      const position = startingPlayerPositionMap.get(pick.playerId) || 'MID';
      const minutesPlayed = s.minutesPlayed || 0;

      bdMinutes += minutesPlayed;

      if (minutesPlayed >= 60) bdAppearancePoints += 2;
      else if (minutesPlayed > 0) bdAppearancePoints += 1;

      const goals = s.goals || 0;
      if (position === 'GK') bdGoalsPoints += goals * 10;
      else if (position === 'DEF') bdGoalsPoints += goals * 6;
      else if (position === 'MID') bdGoalsPoints += goals * 5;
      else bdGoalsPoints += goals * 4;

      bdAssistsPoints += (s.goalAssist || 0) * 3;

      if (s.cleanSheet) {
        if (position === 'GK' || position === 'DEF') bdCleanSheetPoints += 4;
        else if (position === 'MID') bdCleanSheetPoints += 1;
      }

      bdYellowPoints += (s.yellowCards || 0) * -1;
      bdRedPoints += (s.redCards || 0) * -3;
      bdPenMissPoints += (s.penaltyMissed || 0) * -2;

      if (position === 'GK') {
        bdPenSavePoints += (s.penaltySaved || 0) * 5;
        const saves = s.saves || 0;
        if (saves >= 3) bdSavesPoints += Math.floor(saves / 3);
      }

      const defContrib = (s.totalTackle || 0) + (s.totalClearance || 0) + (s.outfielderBlock || 0) + (s.ballRecovery || 0);
      if (position === 'DEF') bdDefensivePoints += Math.floor(defContrib / 10) * 2;
      else bdDefensivePoints += Math.floor(defContrib / 12) * 2;
    }

    const pointsBreakdown = {
      goals: bdGoalsPoints,
      assists: bdAssistsPoints,
      cleanSheet: bdCleanSheetPoints,
      yellowCards: bdYellowPoints,
      redCards: bdRedPoints,
      penaltyMissed: bdPenMissPoints,
      penaltySaved: bdPenSavePoints,
      saves: bdSavesPoints,
      defensive: bdDefensivePoints,
      appearancePoints: bdAppearancePoints,
      totalPoints: currentGwPoints,
    };

    // 11. Season Stats
    let highestGWScore = 0;
    fantasyTeam.history.forEach((h: any) => {
      const score = computeHistoryScore(h.picks, h.gameweek);
      if (score > highestGWScore) highestGWScore = score;
    });
    if (currentGwPoints > highestGWScore) highestGWScore = currentGwPoints;

    const seasonStats = {
      avgPoints: Number((total / Math.max(currentGw, 1)).toFixed(1)),
      totalPoints: total,
      highestPoints: highestGWScore,
      totalRank: (myStanding as any)?.rank || 1,
    };

    // 12. Fixture Difficulty
    const upcomingFixturesList = await FixtureModel.find({ 'status.type': 'notstarted' })
      .sort({ startTimestamp: 1 })
      .limit(5)
      .lean();

    const fixtureDifficulty = [];
    for (const fix of upcomingFixturesList) {
      const homeTeamDoc = await TeamModel.findOne({ id: fix.homeTeam.id }).lean();
      const awayTeamDoc = await TeamModel.findOne({ id: fix.awayTeam.id }).lean();
      fixtureDifficulty.push({
        gameweek: fix.roundInfo?.round || currentGw,
        opponent: awayTeamDoc?.shortName || awayTeamDoc?.name || "OPP",
        home: true,
        difficulty: "Medium" as const,
      });
    }

    // 13. Squad Info & Composition
    const squadPlayerIds = fantasyTeam.currentSquad.picks.map(p => p.playerId);
    const squadPlayerDocs = (await PlayerModel.find({ id: { $in: squadPlayerIds } }).lean()) as any[];
    const squadTeams = (await TeamModel.find({ id: { $in: [...new Set(squadPlayerDocs.map(p => p.teamId))] } }).lean()) as any[];
    const squadTeamMap = new Map(squadTeams.map(t => [t.id, t]));
    const squadPlayerStats = await PlayerStatsModel.find({ playerId: { $in: squadPlayerIds } }).lean();
    const squadPlayerStatsMap = new Map(squadPlayerStats.map(s => [s.playerId, s]));

    const pDocsWithStats = squadPlayerDocs.map(p => {
      const teamDoc = squadTeamMap.get(p.teamId);
      const statDoc = squadPlayerStatsMap.get(p.id);
      return {
        name: p.webName || p.name || "",
        team: fantasyTeam.name || teamDoc?.nameCode || "UNK",
        teamLogo: teamDoc?.logo || "",
        points: statDoc?.totalPoints || 0,
        price: (p.price?.nowCost || 0) / 10,
        position: resolvePosition(p.position || ""),
      };
    });

    const goalkeepers = pDocsWithStats.filter(p => p.position === "GK");
    const defenders = pDocsWithStats.filter(p => p.position === "DEF");
    const midfielders = pDocsWithStats.filter(p => p.position === "MID");
    const forwards = pDocsWithStats.filter(p => p.position === "FWD");

    const startingDEF = startingPlayerDocs.filter((p: any) => resolvePosition(p.position || "") === "DEF").length;
    const startingMID = startingPlayerDocs.filter((p: any) => resolvePosition(p.position || "") === "MID").length;
    const startingFWD = startingPlayerDocs.filter((p: any) => resolvePosition(p.position || "") === "FWD").length;
    const formation = startingPlayerDocs.length > 0 ? `${startingDEF}-${startingMID}-${startingFWD}` : "4-4-2";

    const squadComposition = {
      goalkeepers: goalkeepers.length,
      defenders: defenders.length,
      midfielders: midfielders.length,
      forwards: forwards.length,
      total: pDocsWithStats.length,
      formation,
    };

    const yourPlayers = {
      goalkeepers,
      defenders,
      midfielders,
      forwards,
    };

    const squadInfo = {
      teamValue: (fantasyTeam.finance.utilisation || 0) / 10,
      inBank: (fantasyTeam.finance.balance || 0) / 10,
      bank: (fantasyTeam.finance.balance || 0) / 10,
    };

    const leagueStandings = standingsData.map(s => ({
      rank: (s as any).rank,
      team: s.team,
      team_id: s.team_id,
      manager: s.manager,
      gameweekPoints: s.current_gw,
      totalPoints: s.total,
      rankChange: s.pos_change,
    }));

    return res.json({
      data: {
        teamOverview,
        gameweekProgress,
        upcomingMatch,
        leagueStats,
        leagueStandings,
        recentGameweeks,
        topPlayers,
        playerSpotlight,
        pointsBreakdown,
        seasonStats,
        bestPerformers,
        fixtureDifficulty,
        squadInfo,
        squadComposition,
        yourPlayers,
        miniLeague: leagueStandings,
      }
    });

  } catch (error) {
    console.error("Error in dashboard controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};