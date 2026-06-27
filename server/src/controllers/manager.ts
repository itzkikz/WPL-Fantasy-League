import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
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
    const teams = (await Team.find({ 'team.id': { $in: teamIds } }).lean()) as any[];
    const teamMap = new Map(teams.map(t => [t.team.id, t]));

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
        .select('playerId gameweeks.id gameweeks.points gameweeks.stats.games.minutes')
        .lean();
    const playerStatsMap = new Map(playerStatsList.map(ps => [ps.playerId, ps]));

    let captainPlayed = false;
    const captainPick = currentSquad.picks.find(p => p.isCaptain);
    if (captainPick) {
        const cPs = playerStatsMap.get(captainPick.playerId);
        if (cPs && cPs.gameweeks) {
            const cGw = cPs.gameweeks.find((g: any) => g.id === targetGw);
            if (cGw && cGw.stats && cGw.stats.games && cGw.stats.games.minutes > 0) {
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
        
        team_short_name: teamDoc?.team?.code || "UNK",
        team_color: teamDoc?.teamColors?.primary || "#003399", 
        team_text_color: teamDoc?.teamColors?.text || "#ffffff",
        shirtNumber: playerDoc?.number || 0,
        photo: playerDoc?.photo || ""
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
          console.error('[Substitution Failed]', result.error, { inId, outId, startOutCat: swappedData.starting, benchInIdx: swappedData.bench.map((p:any) => p.id) });
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
}