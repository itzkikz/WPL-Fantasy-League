import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import dayjs from "dayjs";
import { FantasyTeam } from "../models/FantasyTeam";
import { TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { aggregateMatchStats, getGameweekPoints, getGameweekMinutes, getGameweekStats, getGameweekForm, getGameweekEntries, getGameweekBreakdown, buildCurrentWeek } from "./players";
import { validateAndApplySwap } from "../lib/validators/substitution";
import { getSeasonPointsBreakdown } from "../lib/points";
import { Substitution as SubstitutionType } from "../types/manager";
import { FormationResult } from "../lib/formatter/types";
import { setCaptain, setViceCaptain } from "../lib/helpers/roleUpdate";
import { resolvePosition } from "../utils";
import { getStandingsData } from "./standings";
import { ApiConfig } from "../models/ApiConfig";
import { Player } from "../models/Player";
import { Team } from "../models/Team";
import { Gameweek } from "../models/Gameweek";
import { PlayerStats } from "../models/PlayerStats";
import { Fixture } from "../models/Fixture";
import { Substitution } from "../models/Substitution";
import { Fact } from "../models/Fact";



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

    const { finance, currentSquad, name: teamName } = fantasyTeam;
    const history: any[] = fantasyTeam.history || [];
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
      .select('playerId totalPoints gameweeks')
      .lean();
    const playerStatsMap = new Map(playerStatsList.map(ps => [ps.playerId, ps]));

    let captainPlayed = false;
    const captainPick = currentSquad.picks.find(p => p.isCaptain);
    if (captainPick) {
      const cPs = playerStatsMap.get(captainPick.playerId);
      if (cPs && cPs.gameweeks) {
        if (getGameweekMinutes(cPs.gameweeks, targetGw) > 0) {
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
        gwPoints = getGameweekPoints(ps.gameweeks, targetGw);
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

    // 4b. Build full PlayerStats for each player (so modal doesn't need extra API calls)
    try {
      const Fixture = (await import("../models/Fixture")).Fixture;

      // Re-fetch teams with league populated for full player stats
      const TeamWithLeague = (await import("../models/Team")).Team;
      const teamsWithLeague = (await TeamWithLeague.find({}).populate({ path: 'league', strictPopulate: false }).lean()) as any[];
      const teamLeagueMap = new Map(teamsWithLeague.map((t: any) => [t.id, t]));

      // Fetch all FantasyTeams for ownership calculation
      const allFantasyTeams = await FantasyTeam.find({}).select('currentSquad.picks.playerId name').lean();
      const totalTeamsCount = allFantasyTeams.length;

      const ownershipMap = new Map<number, { pct: number; teamName: string | null }>();
      for (const pid of playerIds) {
        let count = 0;
        let tName: string | null = null;
        for (const ft of allFantasyTeams) {
          const picks = (ft as any).currentSquad?.picks || [];
          if (picks.some((p: any) => p.playerId === pid)) {
            count++;
            if (!tName) tName = (ft as any).name;
          }
        }
        const pct = totalTeamsCount > 0 ? Number(((count / totalTeamsCount) * 100).toFixed(1)) : 0;
        ownershipMap.set(pid, { pct, teamName: tName });
      }

      // Fetch upcoming fixtures for all players' teams
      const allTeamIdsForFixtures = [...new Set(squadAsTeamDetails.map(d => {
        const p = pMap.get(d.player_id!);
        return p?.teamId;
      }).filter(Boolean))] as number[];

      // Determine upcoming rounds from the gameweek lifecycle. The fixture
      // `status` field is unreliable (stale/always "finished"), so it cannot
      // be used to decide which fixtures are upcoming.
      const upcomingGwDocs = (await Gameweek.find({ isCompleted: { $ne: true }, number: { $gte: targetGw } }).select('number').lean()) as any[];
      const upcomingRounds = upcomingGwDocs.map((g) => g.number);

      const upcomingDocs = await Fixture.find({
        'roundInfo.round': { $in: upcomingRounds },
        $or: [
          { 'homeTeam.id': { $in: allTeamIdsForFixtures } },
          { 'awayTeam.id': { $in: allTeamIdsForFixtures } }
        ]
      }).sort({ 'roundInfo.round': 1, startTimestamp: 1 }).lean() as any[];

      // Build a team lookup from all teams appearing in the upcoming fixtures
      // (the squad-scoped `teamMap`/`teamLeagueMap` are too small to resolve
      // every opponent), so upcoming opponent names resolve.
      const upcomingTeamIds = [...new Set(upcomingDocs.flatMap((f: any) => [f.homeTeam?.id, f.awayTeam?.id]).filter(Boolean))];
      const upcomingTeamDocs = (await Team.find({ id: { $in: upcomingTeamIds } }).lean()) as any[];
      const upcomingTeamMap = new Map(upcomingTeamDocs.map((t: any) => [t.id, t]));

      // Fetch the target gameweek's fixtures for per-match labels.
      // Use the gameweek's assigned fixture list (fixture `roundInfo.round`
      // can differ from the app gameweek number) and attach full team docs
      // (fixtures only store team ids) so opponent names resolve.
      const tgwDoc = (await Gameweek.findOne({ number: targetGw }).select('fixtures').lean()) as any;
      const tgwFixtureIds = (tgwDoc?.fixtures || []) as number[];
      const currentGwDocs = tgwFixtureIds.length > 0
        ? (await Fixture.find({ fixtureId: { $in: tgwFixtureIds } }).sort({ startTimestamp: 1 }).lean() as any[])
        : [];
      const cgTeamIds = [...new Set(currentGwDocs.flatMap((f: any) => [f.homeTeam?.id, f.awayTeam?.id]).filter(Boolean))];
      const cgTeams = (await Team.find({ id: { $in: cgTeamIds } }).lean()) as any[];
      const fixtureTeamMap = new Map(cgTeams.map((t: any) => [t.id, t]));
      const currentGwFixtureMap = new Map(currentGwDocs.map((f: any) => {
        const home = f.homeTeam?.id != null ? fixtureTeamMap.get(f.homeTeam.id) : null;
        const away = f.awayTeam?.id != null ? fixtureTeamMap.get(f.awayTeam.id) : null;
        return [f.fixtureId ?? f.id, { home: home || f.homeTeam, away: away || f.awayTeam, kickoff: f.startTimestamp }];
      }));

      // Group fixtures by team ID
      const fixturesByTeam = new Map<number, any[]>();
      for (const f of upcomingDocs) {
        const homeId = f.homeTeam?.id;
        const awayId = f.awayTeam?.id;
        if (homeId && !fixturesByTeam.has(homeId)) fixturesByTeam.set(homeId, []);
        if (awayId && !fixturesByTeam.has(awayId)) fixturesByTeam.set(awayId, []);
        if (homeId) fixturesByTeam.get(homeId)!.push({ fixture: f, isHome: true, opponentId: awayId });
        if (awayId) fixturesByTeam.get(awayId)!.push({ fixture: f, isHome: false, opponentId: homeId });
      }

      // Build full PlayerStats for each player
      for (const detail of squadAsTeamDetails) {
        const pid = detail.player_id;
        const playerDoc = pMap.get(pid!);
        if (!playerDoc) continue;

        const clubData = teamLeagueMap.get(playerDoc.teamId) || teamMap.get(playerDoc.teamId);
        const fullPs = playerStatsMap.get(pid!);
        const ownership = ownershipMap.get(pid!) || { pct: 0, teamName: null };

        const teamColor = clubData?.teamColors?.primary || detail.team_color || "#003399";
        const teamTextColor = clubData?.teamColors?.text || detail.team_text_color || "#ffffff";
        const teamLogo = clubData?.logo || detail.team_logo || "";
        const teamShortName = clubData?.nameCode || detail.team_short_name || "UNK";
        const teamNameStr = clubData?.name || detail.club || "Unknown";
        const leagueName = clubData?.league ? (clubData.league as any).name : "Unknown League";

        // Overall stats
        let overallStats: any = aggregateMatchStats([]);
        if (fullPs && (fullPs as any).gameweeks) {
          overallStats = aggregateMatchStats((fullPs as any).gameweeks);
        }
        (overallStats as any).total_point = (fullPs as any)?.totalPoints || 0;

        // Current week stats
        let currentWeekStats = undefined;
        if (fullPs && (fullPs as any).gameweeks) {
          const gwEntries = getGameweekEntries((fullPs as any).gameweeks, targetGw);
          if (gwEntries.length > 0) {
            currentWeekStats = buildCurrentWeek(fullPs, targetGw, playerDoc.position, playerDoc.teamId, currentGwFixtureMap);
          }
        }

        // Upcoming fixtures
        const teamFixtures = fixturesByTeam.get(playerDoc.teamId) || [];
        const upcomingFixtures = teamFixtures.slice(0, 3).map(({ fixture: f, isHome, opponentId }) => {
          const opponentTeam = upcomingTeamMap.get(opponentId) || teamLeagueMap.get(opponentId) || teamMap.get(opponentId);
          const myTeam = clubData;
          return {
            gw: f.roundInfo?.round || 0,
            opponent_short_name: opponentTeam?.nameCode || "UNK",
            opponent_logo: opponentTeam?.logo || "",
            opponent_color: opponentTeam?.teamColors?.primary || "#003399",
            opponent_text_color: opponentTeam?.teamColors?.text || "#ffffff",
            my_team_short_name: myTeam?.nameCode || "UNK",
            my_team_logo: myTeam?.logo || "",
            is_home: isHome
          };
        });

        // Pad to 3
        while (upcomingFixtures.length < 3) {
          const nextGw = targetGw + upcomingFixtures.length;
          upcomingFixtures.push({
            gw: nextGw,
            opponent_short_name: "TBD",
            opponent_logo: "",
            opponent_color: "#1b1035",
            opponent_text_color: "#ffffff",
            my_team_short_name: teamShortName,
            my_team_logo: "",
            is_home: true
          });
        }

        // Recent form
        const recentForm: any[] = (fullPs && (fullPs as any).gameweeks)
          ? getGameweekForm((fullPs as any).gameweeks, targetGw).slice(-5)
          : [];
        if (recentForm.length === 0) {
          for (let i = Math.max(1, targetGw - 4); i <= targetGw; i++) {
            recentForm.push({ gw: i, points: 0 });
          }
        }

        // Points breakdown (per-match, summed across a multi-match gameweek)
        const pointsBreakdown: any[] = (fullPs && (fullPs as any).gameweeks)
          ? getGameweekBreakdown((fullPs as any).gameweeks, targetGw, playerDoc.position)
          : [];

        // Season points breakdown (per-match flooring applied and summed across all gameweeks)
        const seasonPointsBreakdown = (fullPs && (fullPs as any).gameweeks)
          ? getSeasonPointsBreakdown((fullPs as any).gameweeks, playerDoc.position)
          : [];

        // Attach full PlayerStats to the detail
        (detail as any).playerStats = {
          player_name: playerDoc.name || playerDoc.webName || "",
          team_name: teamNameStr,
          position: resolvePosition(playerDoc.position || ''),
          overall: overallStats,
          price: playerDoc.price?.nowCost || 0,
          release_value: playerDoc.price?.nowCost || 0,
          club: teamNameStr,
          league: leagueName,
          team_short_name: teamShortName,
          team_color: teamColor,
          team_text_color: teamTextColor,
          team_logo: teamLogo,
          player_id: pid,
          current_week: currentWeekStats,
          photo: playerDoc.photo || "",
          ownership: ownership.pct,
          fantasy_team_name: ownership.teamName,
          upcoming_fixtures: upcomingFixtures,
          recent_form: recentForm,
          points_breakdown: pointsBreakdown,
          season_points_breakdown: seasonPointsBreakdown,
          auctionPrice: playerDoc.auctionPrice
        };
      }
    } catch (statsErr) {
      console.error("Error building full player stats in manager details:", statsErr);
    }

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
        teamId: fantasyTeam._id?.toString() || "",
        logo: fantasyTeam.logo || "",
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

    // --- Check global pick team status & deadline ---
    const ApiConfig = (await import("../models/ApiConfig")).ApiConfig;
    const Gameweek = (await import("../models/Gameweek")).Gameweek;
    
    const apiConfig = await ApiConfig.findOne({ key: 'pick_team_enabled' });
    const isPickTeamEnabled = apiConfig ? apiConfig.lastUpdatedString === 'true' : false;

    let deadlineDate: Date | undefined = apiConfig?.deadlineDate;
    if (!deadlineDate) {
      const currentGwDoc = await Gameweek.findOne({ isCurrent: true }).lean();
      if (currentGwDoc?.endDate) {
        deadlineDate = new Date(currentGwDoc.endDate);
      }
    }

    const isDeadlinePassed = deadlineDate ? new Date() > new Date(deadlineDate) : false;

    if (!isPickTeamEnabled) {
      return res.status(403).json({ error: 'Squad edits are currently disabled by administrator.' });
    }

    if (isDeadlinePassed) {
      return res.status(403).json({ error: 'Squad edits are locked because the Gameweek deadline has passed.' });
    }

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
        type: pick.isCaptain ? "CAPTAIN" : pick.isViceCaptain ? "VICE CAPTAIN" : null,
        position: resolvePosition(p?.position || ''),
        // Add other mock fields if validators need them
        player_id: pick.playerId,
        role: pick.isCaptain ? "CAPTAIN" : pick.isViceCaptain ? "VICE CAPTAIN" : null,

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

    // Track successful swaps for history recording
    const successfulSwaps: Array<{ swapIn: any; swapOut: any }> = [];
    
    // Track captain/vice-captain changes for history
    let originalCaptain: any = null;
    let originalViceCaptain: any = null;
    
    // Find original captain and vice-captain from current formation
    const findPlayerInFormation = (formation: FormationResult, playerId: number) => {
      for (const cat of ['GK', 'DEF', 'MID', 'FWD'] as const) {
        const found = formation.starting[cat].find((p: any) => p.id === playerId);
        if (found) return found;
      }
      const found = formation.bench.find((p: any) => p.id === playerId);
      if (found) return found;
      return null;
    };
    
    // Get original captain/vice from the original squad picks
    const originalCaptainPick = fantasyTeam.currentSquad.picks.find(p => p.isCaptain);
    const originalVicePick = fantasyTeam.currentSquad.picks.find(p => p.isViceCaptain);
    
    if (originalCaptainPick) {
      originalCaptain = findPlayerInFormation(currentFormation, originalCaptainPick.playerId);
    }
    if (originalVicePick) {
      originalViceCaptain = findPlayerInFormation(currentFormation, originalVicePick.playerId);
    }

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
        
        // Store successful swap for history
        successfulSwaps.push({
          swapIn: result.swappedIn,
          swapOut: result.swappedOut
        });

        swappedData.starting = result.starting;
        swappedData.bench = result.bench;
      }
    }

    // 2. Process Roles
    let newCaptain: any = null;
    let newViceCaptain: any = null;
    
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

    // Find new captain and vice-captain after role changes
    const findNewPlayer = (formation: FormationResult, isCaptain: boolean, isViceCaptain: boolean) => {
      for (const cat of ['GK', 'DEF', 'MID', 'FWD'] as const) {
        const found = formation.starting[cat].find((p: any) => isCaptain ? p.isCaptain : p.isViceCaptain);
        if (found) return found;
      }
      const found = formation.bench.find((p: any) => isCaptain ? p.isCaptain : p.isViceCaptain);
      if (found) return found;
      return null;
    };
    
    newCaptain = findNewPlayer(swappedData, true, false);
    newViceCaptain = findNewPlayer(swappedData, false, true);

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

    // 4. Record substitution history (non-blocking)
    const hasChanges = successfulSwaps.length > 0 || 
      (originalCaptain && newCaptain && originalCaptain.id !== newCaptain.id) ||
      (originalViceCaptain && newViceCaptain && originalViceCaptain.id !== newViceCaptain.id);
    
    if (hasChanges) {
      try {
        // Determine current gameweek
        const GameweekModel = (await import("../models/Gameweek")).Gameweek;
        let currentGwDoc = await GameweekModel.findOne({ isCurrent: true });
        if (!currentGwDoc) {
          currentGwDoc = await GameweekModel.findOne({ isNext: true });
        }
        const targetGw = currentGwDoc ? currentGwDoc.number : 1;

        const substitutionRecords: any[] = [];

        // Add swap records
        successfulSwaps.forEach(swap => {
          substitutionRecords.push({
            fantasyTeam: fantasyTeam._id,
            teamName: fantasyTeam.name,
            type: 'swap',
            gameweek: targetGw,
            swapIn: {
              playerId: swap.swapIn.id || swap.swapIn.player_id,
              name: swap.swapIn.name,
              position: swap.swapIn.position,
              teamId: swap.swapIn.teamId || 0
            },
            swapOut: {
              playerId: swap.swapOut.id || swap.swapOut.player_id,
              name: swap.swapOut.name,
              position: swap.swapOut.position,
              teamId: swap.swapOut.teamId || 0
            },
            createdBy: user._id,
            date: new Date()
          });
        });

        // Add captain change record
        if (originalCaptain && newCaptain && originalCaptain.id !== newCaptain.id) {
          substitutionRecords.push({
            fantasyTeam: fantasyTeam._id,
            teamName: fantasyTeam.name,
            type: 'captain',
            gameweek: targetGw,
            swapIn: {
              playerId: newCaptain.id,
              name: newCaptain.name,
              position: newCaptain.position,
              teamId: newCaptain.teamId || 0
            },
            swapOut: {
              playerId: originalCaptain.id,
              name: originalCaptain.name,
              position: originalCaptain.position,
              teamId: originalCaptain.teamId || 0
            },
            createdBy: user._id,
            date: new Date()
          });
        }

        // Add vice-captain change record
        if (originalViceCaptain && newViceCaptain && originalViceCaptain.id !== newViceCaptain.id) {
          substitutionRecords.push({
            fantasyTeam: fantasyTeam._id,
            teamName: fantasyTeam.name,
            type: 'vice-captain',
            gameweek: targetGw,
            swapIn: {
              playerId: newViceCaptain.id,
              name: newViceCaptain.name,
              position: newViceCaptain.position,
              teamId: newViceCaptain.teamId || 0
            },
            swapOut: {
              playerId: originalViceCaptain.id,
              name: originalViceCaptain.name,
              position: originalViceCaptain.position,
              teamId: originalViceCaptain.teamId || 0
            },
            createdBy: user._id,
            date: new Date()
          });
        }

        if (substitutionRecords.length > 0) {
          await Substitution.insertMany(substitutionRecords);
        }
      } catch (historyError) {
        console.error("Failed to record substitution history:", historyError);
        // Non-blocking: squad update already succeeded
      }
    }

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

    const history: any[] = fantasyTeam.history || [];

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

    // 2. Parallel fetch for independent data sources
    const [
      fantasyTeam,
      currentGwDocResult,
      apiConfig,
      standingsData,
      totalManagers,
      totalTeams,
      nextFixture,
      upcomingFixturesList
    ] = await Promise.all([
      FantasyTeam.findOne({ managers: user._id }).populate('managers', 'username'),
      Gameweek.findOne({ isCurrent: true }).lean().then(async gw => gw || (await Gameweek.findOne({ isNext: true }).lean())),
      ApiConfig.findOne({ key: 'pick_team_enabled' }).lean(),
      getStandingsData(),
      User.countDocuments({ role: 'manager' }),
      FantasyTeam.countDocuments(),
      Fixture.findOne({ 'status.type': 'notstarted' }).sort({ startTimestamp: 1 }).lean(),
      Fixture.find({ 'status.type': 'notstarted' }).sort({ startTimestamp: 1 }).limit(5).lean()
    ]);

    const history: any[] = fantasyTeam?.history || [];

    const currentGwDoc = currentGwDocResult;
    const currentGw = currentGwDoc ? currentGwDoc.number : 1;
    const pickMyTeam = apiConfig ? apiConfig.lastUpdatedString === 'true' : false;
    const deadlineDate = apiConfig?.deadlineDate || currentGwDoc?.endDate || new Date();

    // 3. Standings & League details
    const myStanding = fantasyTeam ? standingsData.find(s => s.team_id === fantasyTeam._id.toString()) : undefined;
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
    const teamOverview = fantasyTeam
      ? {
          teamName: fantasyTeam.name,
          logo: fantasyTeam.logo || "",
          managers: (fantasyTeam.managers as any[]).map(m => m.username),
          gameweek: currentGw,
          gwPoints: currentGwPoints,
          totalPoints: total,
          rank: rank,
          transfers: fantasyTeam.currentSquad.picks.length > 0 ? 1 : 0,
          rankChange: pos_change,
        }
      : null;

    const leagueStats = {
      totalPoints: total,
      overallRank: rank,
      avgPointsPerGW: Number(avg.toFixed(1)),
      highestGW: highest,
      teamValue: (fantasyTeam?.finance?.utilisation || 0) / 10,
      totalManagers,
      totalTeams,
    };

    // 5. Gameweek Progress
    const gameweekProgress = fantasyTeam
      ? {
          teamSelected: fantasyTeam.currentSquad.picks.length > 0,
          transfersMade: false,
          captainChosen: fantasyTeam.currentSquad.picks.some(p => p.isCaptain),
          teamConfirmed: true,
          deadline: dayjs(deadlineDate).format("dddd, h:mm A"),
          startDate: currentGwDoc?.startDate ? new Date(currentGwDoc.startDate).toISOString() : null,
          endDate: currentGwDoc?.endDate ? new Date(currentGwDoc.endDate).toISOString() : null,
        }
      : null;

    // 6. Upcoming Match & 12. Fixture Difficulty (Batched Team Lookups)
    const fixtureTeamIds = new Set<number>();
    if (nextFixture) {
      if (nextFixture.homeTeam?.id) fixtureTeamIds.add(nextFixture.homeTeam.id);
      if (nextFixture.awayTeam?.id) fixtureTeamIds.add(nextFixture.awayTeam.id);
    }
    for (const fix of upcomingFixturesList) {
      if (fix.homeTeam?.id) fixtureTeamIds.add(fix.homeTeam.id);
      if (fix.awayTeam?.id) fixtureTeamIds.add(fix.awayTeam.id);
    }

    const fixtureTeamsDocs = await Team.find({ id: { $in: Array.from(fixtureTeamIds) } }).lean();
    const fixtureTeamMap = new Map(fixtureTeamsDocs.map(t => [t.id, t]));

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
      const homeTeamDoc = fixtureTeamMap.get(nextFixture.homeTeam.id);
      const awayTeamDoc = fixtureTeamMap.get(nextFixture.awayTeam.id);
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

    const fixtureDifficulty = upcomingFixturesList.map(fix => {
      const awayTeamDoc = fixtureTeamMap.get(fix.awayTeam.id);
      return {
        gameweek: fix.roundInfo?.round || currentGw,
        opponent: awayTeamDoc?.shortName || awayTeamDoc?.name || "OPP",
        home: true,
        difficulty: "Medium" as const,
      };
    });

    // 7. Recent Gameweeks History Stats
    const allHistoryPicks = history.flatMap(h => h.picks);
    const allHistoryPlayerIds = [...new Set(allHistoryPicks.map(p => p.playerId))];
    const historyPlayerStats = await PlayerStats.find({ playerId: { $in: allHistoryPlayerIds } })
        .select('playerId gameweeks.id gameweeks.points gameweeks.stats.minutesPlayed')
        .lean();
    const historyPsMap = new Map(historyPlayerStats.map(ps => [ps.playerId, ps]));

    const computeHistoryScore = (picks: any[], gwId: number) => {
      let score = 0;
      let captainPlayed = false;

      const captainPick = picks.find(p => p.isCaptain);
      if (captainPick) {
        const cStats = historyPsMap.get(captainPick.playerId);
        if (cStats && cStats.gameweeks) {
          if (getGameweekMinutes(cStats.gameweeks, gwId) > 0) {
            captainPlayed = true;
          }
        }
      }

      picks.forEach(pick => {
        if (!pick.isStarting) return;

        const statsDoc = historyPsMap.get(pick.playerId);
        if (statsDoc && statsDoc.gameweeks) {
          const pts = getGameweekPoints(statsDoc.gameweeks, gwId);
          if (pts > 0) {
            score += pick.isCaptain && captainPlayed
              ? pts * 2
              : (pick.isViceCaptain && !captainPlayed ? pts * 2 : pts);
          }
        }
      });
      return score;
    };

    const recentGameweeks = fantasyTeam
      ? history.map(h => ({
          gameweek: h.gameweek,
          points: computeHistoryScore(h.picks, h.gameweek),
        })).sort((a, b) => a.gameweek - b.gameweek)
      : [];

    if (fantasyTeam && !history.some(h => h.gameweek === currentGw)) {
      recentGameweeks.push({
        gameweek: currentGw,
        points: currentGwPoints,
      });
    }

    // 8. Top Players & Best Performers
    const allFantasyTeams = await FantasyTeam.find({}).select('name currentSquad.picks.playerId').lean();
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

    const ownedPlayersWithStats = await PlayerStats.find({ playerId: { $in: Array.from(allOwnedPlayerIds) } })
        .select(
            'playerId totalPoints ' +
            'gameweeks.id gameweeks.points ' +
            'gameweeks.stats.minutesPlayed gameweeks.stats.goals gameweeks.stats.goalAssist gameweeks.stats.cleanSheet ' +
            'gameweeks.stats.yellowCards gameweeks.stats.redCards gameweeks.stats.penaltyMissed gameweeks.stats.penaltySaved ' +
            'gameweeks.stats.saves gameweeks.stats.totalTackle gameweeks.stats.totalClearance gameweeks.stats.outfielderBlock gameweeks.stats.ballRecovery'
        )
        .lean();

    const sortedGwStats = [...ownedPlayersWithStats]
      .map(stat => {
        return {
          playerId: stat.playerId,
          gwPoints: stat.gameweeks ? getGameweekPoints(stat.gameweeks, currentGw) : 0,
        };
      })
      .sort((a, b) => b.gwPoints - a.gwPoints)
      .slice(0, 5);

    const sortedStats = [...ownedPlayersWithStats].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 5);

    const startingPicks = fantasyTeam ? fantasyTeam.currentSquad.picks.filter(p => p.isStarting) : [];
    const startingPlayerIds = startingPicks.map(p => p.playerId);
    const squadPlayerIds = fantasyTeam ? fantasyTeam.currentSquad.picks.map(p => p.playerId) : [];

    const neededPlayerIds = new Set<number>([
      ...sortedGwStats.map(s => s.playerId),
      ...sortedStats.map(s => s.playerId),
      ...startingPlayerIds,
      ...squadPlayerIds,
      ...Array.from(allOwnedPlayerIds)
    ]);

    const playersDocs = await Player.find({ id: { $in: Array.from(neededPlayerIds) } }).lean() as any[];
    const pDocsMap = new Map(playersDocs.map(p => [p.id, p]));

    const neededTeamIds = new Set<number>(playersDocs.map(p => p.teamId));
    const teamsDocs = await Team.find({ id: { $in: Array.from(neededTeamIds) } }).lean() as any[];
    const tDocsMap = new Map(teamsDocs.map(t => [t.id, t]));

    const topPlayers = sortedGwStats.map((stat, index) => {
      const playerDoc = pDocsMap.get(stat.playerId);
      const teamDoc = playerDoc ? tDocsMap.get(playerDoc.teamId) : null;
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

    // 9. Player Spotlight (Best player of each team)
    const teamTopStatsMap = new Map<string, any>();
    for (const stat of ownedPlayersWithStats) {
      const teamName = playerToFantasyTeam.get(stat.playerId);
      if (!teamName) continue;
      const currentTop = teamTopStatsMap.get(teamName);
      if (!currentTop || (stat.totalPoints || 0) > (currentTop.totalPoints || 0)) {
        teamTopStatsMap.set(teamName, stat);
      }
    }

    const spotlightPlayers: any[] = [];
    for (const [teamName, topStat] of teamTopStatsMap.entries()) {
      const topPlayerDoc = pDocsMap.get(topStat.playerId);
      const topTeamDoc = topPlayerDoc ? tDocsMap.get(topPlayerDoc.teamId) : null;
      const currentGwStats = topStat.gameweeks?.find((g: any) => g.id === currentGw);
      const currentGwPoints = topStat.gameweeks ? getGameweekPoints(topStat.gameweeks, currentGw) : 0;
      const recentGws = getGameweekForm(topStat.gameweeks || [], currentGw).slice(-5);

      let gwStats: any = {};
      if (topStat.gameweeks) {
        const gwEntries = getGameweekEntries(topStat.gameweeks, currentGw);
        if (gwEntries.length > 0) {
          gwStats = getGameweekStats(topStat.gameweeks, currentGw);
        } else if (currentGwStats?.stats) {
          gwStats = currentGwStats.stats;
        }
      }

      spotlightPlayers.push({
        player: {
          id: topPlayerDoc?.id || 0,
          name: topPlayerDoc?.webName || topPlayerDoc?.name || "Unknown",
          team: teamName || topTeamDoc?.nameCode || "UNK",
          teamColor: topTeamDoc?.teamColors?.primary || "#6CABDD",
          teamLogo: topTeamDoc?.logo || "",
          point: currentGwPoints,
          position: resolvePosition(topPlayerDoc?.position || ""),
          isCaptain: false,
          isViceCaptain: false,
          isPowerPlayer: false,
          fullTeamName: teamName || topTeamDoc?.name || "Unknown",
          photo: topPlayerDoc?.photo || (topPlayerDoc?.id ? `https://img.sofascore.com/api/v1/player/${topPlayerDoc.id}/image` : ""),
        },
        gameweekPoints: currentGwPoints,
        totalPoints: topStat.totalPoints || 0,
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
      });
    }

    const playerSpotlight = spotlightPlayers.length > 0 ? spotlightPlayers[0] : {};

    // 10. Points Breakdown
    const startingStatsMap = new Map(ownedPlayersWithStats.map(s => [s.playerId, s]));
    const startingPlayerPositionMap = new Map(startingPicks.map(p => {
      const doc = pDocsMap.get(p.playerId);
      return [p.playerId, resolvePosition(doc?.position || '')];
    }));

    let bdGoalsPoints = 0, bdAssistsPoints = 0, bdCleanSheetPoints = 0;
    let bdYellowPoints = 0, bdRedPoints = 0, bdPenMissPoints = 0, bdPenSavePoints = 0;
    let bdSavesPoints = 0, bdMinutes = 0, bdAppearancePoints = 0, bdDefensivePoints = 0;

    // Per-match accumulation: each fixture in the gameweek is scored separately,
    // then merged, so multi-match gameweeks never collapse to merged-stats math.
    for (const pick of startingPicks) {
      const statsDoc = startingStatsMap.get(pick.playerId);
      if (!statsDoc || !statsDoc.gameweeks) continue;
      const gwEntries = getGameweekEntries(statsDoc.gameweeks, currentGw);
      if (gwEntries.length === 0) continue;
      const position = startingPlayerPositionMap.get(pick.playerId) || 'MID';

      for (const entry of gwEntries) {
        const s = entry.stats;
        if (!s || !s.minutesPlayed) continue;
        const minutesPlayed = s.minutesPlayed || 0;

        bdMinutes += minutesPlayed;
        if (minutesPlayed >= 60) bdAppearancePoints += 2;
        else bdAppearancePoints += 1;

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
    }

    const pointsBreakdown = fantasyTeam
      ? {
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
        }
      : null;

    // 11. Season Stats
    let highestGWScore = 0;
    history.forEach((h: any) => {
      const score = computeHistoryScore(h.picks, h.gameweek);
      if (score > highestGWScore) highestGWScore = score;
    });
    if (currentGwPoints > highestGWScore) highestGWScore = currentGwPoints;

    const seasonStats = fantasyTeam
      ? {
          avgPoints: Number((total / Math.max(currentGw, 1)).toFixed(1)),
          totalPoints: total,
          highestPoints: highestGWScore,
          totalRank: (myStanding as any)?.rank || 1,
          rankChange: pos_change,
          totalGoals: pointsBreakdown?.goals || 0,
          totalAssists: pointsBreakdown?.assists || 0,
          cleanSheets: pointsBreakdown?.cleanSheet || 0,
        }
      : null;

    // 13. Squad Info & Composition
    let squadComposition: any = null;
    let yourPlayers: any = null;
    let squadInfo: any = null;

    if (fantasyTeam) {
      const pDocsWithStats = squadPlayerIds.map(id => {
        const p = pDocsMap.get(id);
        if (!p) return null;
        const teamDoc = tDocsMap.get(p.teamId);
        const statDoc = startingStatsMap.get(p.id);
        const pick = fantasyTeam.currentSquad?.picks?.find(pk => pk.playerId === p.id);
        return {
          id: p.id,
          name: p.webName || p.name || "",
          team: teamDoc?.nameCode || teamDoc?.name || "UNK",
          teamLogo: teamDoc?.logo || "",
          photo: p.photo || (p.id ? `https://img.sofascore.com/api/v1/player/${p.id}/image` : ""),
          points: statDoc?.totalPoints || 0,
          price: (p.price?.nowCost || 0) / 10,
          position: resolvePosition(p.position || ""),
          isCaptain: pick?.isCaptain || false,
          isViceCaptain: pick?.isViceCaptain || false,
          isStarting: pick?.isStarting || false,
        };
      }).filter(Boolean) as any[];

      const goalkeepers = pDocsWithStats.filter(p => p.position === "GK");
      const defenders = pDocsWithStats.filter(p => p.position === "DEF");
      const midfielders = pDocsWithStats.filter(p => p.position === "MID");
      const forwards = pDocsWithStats.filter(p => p.position === "FWD");

      const startingDEF = startingPlayerIds.filter(id => resolvePosition(pDocsMap.get(id)?.position || "") === "DEF").length;
      const startingMID = startingPlayerIds.filter(id => resolvePosition(pDocsMap.get(id)?.position || "") === "MID").length;
      const startingFWD = startingPlayerIds.filter(id => resolvePosition(pDocsMap.get(id)?.position || "") === "FWD").length;
      const formation = startingPlayerIds.length > 0 ? `${startingDEF}-${startingMID}-${startingFWD}` : "4-4-2";

      squadComposition = {
        goalkeepers: goalkeepers.length,
        defenders: defenders.length,
        midfielders: midfielders.length,
        forwards: forwards.length,
        total: pDocsWithStats.length,
        formation,
      };

      yourPlayers = {
        goalkeepers,
        defenders,
        midfielders,
        forwards,
      };

      const totalBudget = (fantasyTeam.finance?.totalBudget ?? 1000) / 10;
      const utilisation = (fantasyTeam.finance?.utilisation ?? 0) / 10;
      const bonus = (fantasyTeam.finance?.bonus ?? 0) / 10;
      const fine = (fantasyTeam.finance?.fine ?? 0) / 10;
      const bank = (fantasyTeam.finance?.balance ?? ((fantasyTeam.finance?.totalBudget ?? 1000) - (fantasyTeam.finance?.utilisation ?? 0) + (fantasyTeam.finance?.bonus ?? 0) - (fantasyTeam.finance?.fine ?? 0))) / 10;

      const fallbackPlayerPriceSum = squadPlayerIds.map(id => {
        const p = pDocsMap.get(id);
        if (!p) return 0;
        if (p.auctionPrice != null && p.auctionPrice > 0) return Number(p.auctionPrice);
        return 0;
      }).reduce((sum, v) => sum + v, 0);

      const teamValue = utilisation > 0 ? utilisation : fallbackPlayerPriceSum;
      const totalValue = teamValue + bank;

      squadInfo = {
        teamValue,
        inBank: bank,
        bank,
        totalBudget,
        utilisation,
        bonus,
        fine,
        balance: bank,
        totalValue,
      };
    }

    const leagueStandings = standingsData.map(s => ({
      rank: (s as any).rank,
      team: s.team,
      team_id: s.team_id,
      manager: s.manager,
      gameweekPoints: s.current_gw,
      totalPoints: s.total,
      rankChange: s.pos_change,
    }));

    // 14. Facts / Fantasy News
    const publishedFacts = await Fact.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).limit(10);
    const fantasyNews = publishedFacts.map(fact => {
      const diffInHours = dayjs().diff(dayjs(fact.createdAt), 'hour');
      let timeText = `${diffInHours}h ago`;
      if (diffInHours < 1) {
        const diffInMins = Math.max(1, dayjs().diff(dayjs(fact.createdAt), 'minute'));
        timeText = `${diffInMins}m ago`;
      } else if (diffInHours >= 24) {
        const diffInDays = Math.floor(diffInHours / 24);
        timeText = `${diffInDays}d ago`;
      }

      return {
        id: fact._id.toString(),
        headline: fact.headline,
        content: fact.content || '',
        category: fact.category || 'Trivia',
        thumbnail: fact.imageUrl || null,
        time: timeText,
        createdAt: fact.createdAt,
      };
    });

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
        spotlightPlayers,
        pointsBreakdown,
        seasonStats,
        bestPerformers,
        fixtureDifficulty,
        squadInfo,
        squadComposition,
        yourPlayers,
        miniLeague: leagueStandings,
        fantasyNews,
      }
    });

  } catch (error) {
    console.error("Error in dashboard controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPublicFacts = async (req: Request, res: Response) => {
  try {
    const publishedFacts = await Fact.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
    const facts = publishedFacts.map(fact => {
      const diffInHours = dayjs().diff(dayjs(fact.createdAt), 'hour');
      let timeText = `${diffInHours}h ago`;
      if (diffInHours < 1) {
        const diffInMins = Math.max(1, dayjs().diff(dayjs(fact.createdAt), 'minute'));
        timeText = `${diffInMins}m ago`;
      } else if (diffInHours >= 24) {
        const diffInDays = Math.floor(diffInHours / 24);
        timeText = `${diffInDays}d ago`;
      }

      return {
        id: fact._id.toString(),
        headline: fact.headline,
        content: fact.content || '',
        category: fact.category || 'Trivia',
        thumbnail: fact.imageUrl || null,
        time: timeText,
        createdAt: fact.createdAt,
      };
    });
    res.json({ data: facts });
  } catch (error: any) {
    console.error("Error fetching public facts:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubstitutionHistory = async (req: Request, res: Response) => {
  try {
    // Admin only
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { teamId, gameweek, type } = req.query;

    const query: any = {};
    if (teamId) query.fantasyTeam = teamId;
    if (gameweek) query.gameweek = Number(gameweek);
    if (type) query.type = type;

    const substitutions = await Substitution.find(query)
      .populate('fantasyTeam', 'name')
      .populate('createdBy', 'username')
      .sort({ date: -1 })
      .lean();

    res.json({
      data: substitutions.map(s => ({
        _id: s._id,
        fantasyTeam: s.fantasyTeam ? (s.fantasyTeam as any)._id : null,
        teamName: s.fantasyTeam ? (s.fantasyTeam as any).name : s.teamName,
        type: s.type,
        gameweek: s.gameweek,
        swapIn: s.swapIn,
        swapOut: s.swapOut,
        date: s.date,
        note: s.note,
        createdBy: s.createdBy ? (s.createdBy as any).username : null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error in getSubstitutionHistory:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};