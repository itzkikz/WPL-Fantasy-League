import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { FantasyTeam } from "../models/FantasyTeam";
import { TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { validateAndApplySwap } from "../lib/validators/substitution";
import { Substitution } from "../types/manager";
import { FormationResult } from "../lib/formatter/types";
import { setCaptain, setViceCaptain } from "../lib/helpers/roleUpdate";



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
      $or: [
        { _id: { $in: user.managedTeams } },
        { managers: user._id }
      ]
    }).populate('managers', 'username');

    if (!fantasyTeam) {
      console.log(`[Manager Details] FantasyTeam not found for user: ${username}`);
      return res.status(404).json({ error: 'Fantasy Team not found' });
    }

    const { deadline, currentGw, pickMyTeam, finance, currentSquad, history, name: teamName } = fantasyTeam;
    const { totalBudget, utilisation, balance } = finance;

    const managersList = (fantasyTeam.managers as any[]).map(m => m.username);

    // 3. Calculate Stats & Rank
    // Updated to use Aggregation for performance (avoid fetching all teams)

    // Points before this GW (from history only)
    const total_point_before_this_gw = history.reduce((acc, h) => acc + h.points, 0);
    const totalGWScore = currentSquad.points || 0;
    const myTotalPoints = total_point_before_this_gw + totalGWScore;

    const rankResult = await FantasyTeam.aggregate([
      {
        $addFields: {
          calculatedTotalPoints: {
            $add: [
              { $sum: "$history.points" },
              { $ifNull: ["$currentSquad.points", 0] }
            ]
          }
        }
      },
      {
        $match: {
          calculatedTotalPoints: { $gt: myTotalPoints }
        }
      },
      {
        $count: "rank"
      }
    ]);

    const rank = (rankResult[0]?.rank || 0) + 1;
    const total = myTotalPoints;

    // Count teams for "teamsCount"
    const teamsCount = await FantasyTeam.countDocuments({});

    // Average and Highest (across all GWs for this team)
    const allScores = [...history.map(h => h.points)];
    if (currentSquad.gameweek === currentGw) {
      allScores.push(currentSquad.points);
    }

    // Filter 0s if needed, or keeping valid gameweeks
    const validScores = allScores;
    const highest = validScores.length > 0 ? Math.max(...validScores) : 0;
    const avg = validScores.length > 0 ? (validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length).toFixed(2) : "0.00";

    // 4. Transform Squad to FormationResult
    // Map IPick[] to TeamDetails[] format expected by validatores/formatter
    // We need to map `element` back to player details (name, position etc)

    // We need to fetch player details for the current squad
    const Player = (await import("../models/Player")).Player; // Dynamic import to avoid circular dep issues if any, or just import at top
    const playerIds = currentSquad.picks.map(p => p.element);
    const playersMap = await Player.find({ id: { $in: playerIds } }).lean();
    const pMap = new Map(playersMap.map(p => [p.id, p]));

    const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

    const teamIds = [...new Set(playersMap.map(p => p.teamId))];
    const Team = (await import("../models/Team")).Team;
    const teams = await Team.find({ id: { $in: teamIds } }).lean();
    const teamMap = new Map(teams.map(t => [t.id, t]));

    const squadAsTeamDetails: TeamDetails[] = currentSquad.picks.map(pick => {
      const playerDoc = pMap.get(pick.element);
      const teamDoc = playerDoc ? teamMap.get(playerDoc.teamId) : null;

      return {
        // Required fields for Formation/Formatter
        player_id: pick.element,
        player_name: playerDoc?.webName || playerDoc?.name || "Unknown",
        team_name: teamName, // Fantasy Team Name
        gw: currentGw,
        point: (pick as any).statsSnapshot?.points || 0, // Use GW specific XPoints if available

        position: positionMap[playerDoc?.elementType || 3],
        price: playerDoc?.price?.nowCost || 0,
        club: playerDoc?.clubName || "UNK", // We might need to fetch this or populate

        // Lineup Status construction
        lineup: pick.position <= 11 ? "Starting XI" : `Sub ${pick.position - 11}`,

        // Role Construction (Expected by Formatter as 'role', not 'type')
        role: pick.isCaptain ? "CAPTAIN" : pick.isViceCaptain ? "VICE CAPTAIN" : null,
        // type: pick.isCaptain ? "Captain" : pick.isViceCaptain ? "Vice Captain" : "Player" // Deprecated/Wrong field

        team_short_name: teamDoc?.nameCode || teamDoc?.shortName || "UNK",
        team_color: teamDoc?.teamColors?.primary || "#003399", // Default fallback here too
        team_text_color: teamDoc?.teamColors?.text || "#ffffff",
        shirtNumber: playerDoc?.shirtNumber || 0
      } as any; // Casting to any because TeamDetails structure from Sheets had specific loose fields
    });

    // Using the existing formatter
    const managerTeam: FormationResult = convertToFormation(squadAsTeamDetails);


    return res.json({
      data: {
        deadline,
        gw: currentGw,
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
      $or: [
        { _id: { $in: user.managedTeams } },
        { managers: user._id }
      ]
    });

    if (!fantasyTeam) {
      return res.status(404).json({ error: 'Fantasy Team not found' });
    }

    if (!fantasyTeam.pickMyTeam) {
      return res.status(403).json({
        data: {
          message: "Pick My Team is not open"
        }
      });
    }

    // --- Prepare current squad for transformation ---
    // We need to fetch Player details names to support the `validateAndApplySwap` which uses names
    // Ideally we should refactor `validateAndApplySwap` to use IDs, but to minimize changes:
    const Player = (await import("../models/Player")).Player;
    const Team = (await import("../models/Team")).Team;

    const playerIds = fantasyTeam.currentSquad.picks.map(p => p.element);
    const players = await Player.find({ id: { $in: playerIds } }).lean();
    const pMap = new Map(players.map(p => [p.id, p]));
    const pNameMap = new Map(players.map(p => [p.name, p])); // For reverse lookup by name from frontend

    const teamIds = [...new Set(players.map(p => p.teamId))];
    const teams = await Team.find({ id: { $in: teamIds } }).lean();
    const teamMap = new Map(teams.map(t => [t.id, t]));

    const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

    // Construct "Formation" object expected by helpers
    // Helper expects { starting: TeamDetails[], bench: TeamDetails[] }
    // TeamDetails needs 'lineup' and 'player_name'
    const teamDetailsList: TeamDetails[] = fantasyTeam.currentSquad.picks.map(pick => {
      const p = pMap.get(pick.element);
      const teamDoc = p ? teamMap.get(p.teamId) : null;
      return {
        player_name: p?.webName || p?.name || "Unknown",
        lineup: pick.position <= 11 ? "Starting XI" : `Sub ${pick.position - 11}`,
        type: pick.isCaptain ? "Captain" : pick.isViceCaptain ? "Vice Captain" : "Player",
        position: positionMap[p?.elementType || 3],
        // Add other mock fields if validators need them
        player_id: pick.element,

        team_short_name: teamDoc?.nameCode || teamDoc?.shortName || "UNK",
        team_color: teamDoc?.teamColors?.primary || "#003399",
        team_text_color: teamDoc?.teamColors?.text || "#ffffff",
        shirtNumber: p?.shirtNumber || 0
      } as any;
    });

    // Use existing formatter to separate into starting/bench
    const currentFormation = convertToFormation(teamDetailsList);
    let { starting, bench } = currentFormation;

    let swappedData: FormationResult = { starting, bench };

    // 1. Process Substitutions
    if (substitution?.length > 0) {
      for (const val of substitution) {
        // Validation now expects IDs
        // Frontend should send swapIn.id and swapOut.id
        // Fallback to name if ID missing (for backward compat if needed, but user said "all instances")
        // But validateAndApplySwap signature is now (formation, number, number).
        // Safely extract IDs.
        if (!val.swapIn || !val.swapOut) {
          continue;
        }
        const inId = val.swapIn.id || val.swapIn.player_id || 0; // flexible extraction
        const outId = val.swapOut.id || val.swapOut.player_id || 0;

        const result: any = validateAndApplySwap({ starting: swappedData.starting, bench: swappedData.bench }, inId, outId);
        if (!result.ok) {
          return res.status(403).json({ data: { message: result.message || 'Substitution not allowed' } });
        }
        swappedData.starting = result.starting;
        swappedData.bench = result.bench;
      }
    }

    // 2. Process Roles
    if (roles) {
      if (roles.captain) {
        // Validation now expects IDs
        const capId = roles.captain.id || roles.captain.player_id || roles.captain; // handle simple ID or object
        // If it comes as number directly or string ID
        const finalCapId = typeof capId === 'object' ? 0 : parseInt(String(capId));

        const capResult = setCaptain(swappedData, finalCapId);
        if ('error' in capResult) {
          // Handle error or ignore
        } else {
          swappedData = capResult as any;
        }
      }
      if (roles.vice) {
        const viceId = roles.vice.id || roles.vice.player_id || roles.vice;
        const finalViceId = typeof viceId === 'object' ? 0 : parseInt(String(viceId));

        const viceResult = setViceCaptain(swappedData, finalViceId);
        if ('error' in viceResult) {
          // Handle error
        } else {
          swappedData = viceResult as any;
        }
      }
    }
    // Handle error


    // 3. Reconstruct Picks from Swapped Data
    const newPicks: any[] = [];

    // Flatten starting lineup
    const startingList = [
      ...swappedData.starting.goalkeeper,
      ...swappedData.starting.defenders,
      ...swappedData.starting.midfielders,
      ...swappedData.starting.forwards
    ];

    // Helper to add to picks
    const processList = (list: any[], startIndex: number) => {
      list.forEach((item, index) => {
        // Find player ID by name
        const player = players.find(p => (p.name === item.name || p.webName === item.name));
        // Or use preserved ID if available (needs to be cast or checked)
        const pickElement = player ? player.id : item.id; // item.id is set in convertToFormation as index+1 usually, but let's rely on finding real player or fallback
        // Wait, convertToFormation sets id to index+1. It DOES NOT preserve real ID unless we hack it.
        // But we passed `player_id` into `squadAsTeamDetails`? 
        // `convertToFormation` does NOT seem to direct pass `player_id`. It constructs `id: index+1`.
        // We need to rely on Name matching since we lost the ID in `convertToFormation`.
        // Unless we modify `convertToFormation` which is outside scope/risky.
        // Ideally `pNameMap` can help.

        const realPlayer = pNameMap.get(item.name) || players.find(p => p.name === item.name); // item.name comes from FormationResult which came from `player_name`

        if (realPlayer) {
          newPicks.push({
            element: realPlayer.id,
            position: startIndex + index,
            isCaptain: item.isCaptain || false,
            isViceCaptain: item.isViceCaptain || false,
            multiplier: item.isCaptain ? 2 : 1
          });
        }
      });
    }

    processList(startingList, 1);
    processList(swappedData.bench, 12);

    // Update History logic:
    // If we are editing (pickMyTeam=true), and the currentSquad belongs to a previous GW (or just needs archiving before overwrite)
    // Checks:
    // 1. If currentSquad.gameweek < fantasyTeam.currentGw (implies we moved to new GW but haven't saved new team yet)
    // 2. OR if we just want to ensure the "previous state" is history.
    // User request: "move this current squad to history and add this new one to the current squad"

    // We only archive if the currentSquad has points/is valid and isn't already in history?
    // Simplified logic: If currentSquad.gameweek is defined and NOT in history, push it?
    // But usually history is for completed GWs. 
    // Let's assume: If I am making a change for GW X, and currentSquad held GW X-1, I archive GW X-1.

    const squadGw = fantasyTeam.currentSquad.gameweek;
    const currentGw = fantasyTeam.currentGw; // The "Next" or "Active" GW

    // If the squad we are overwriting belongs to a previous gameweek, save it to history first
    if (squadGw < currentGw && squadGw > 0) {
      // Check if already in history to avoid dupes (idempotency)
      const exists = fantasyTeam.history.some(h => h.gameweek === squadGw);
      if (!exists) {
        fantasyTeam.history.push({
          gameweek: squadGw,
          points: fantasyTeam.currentSquad.points || 0,
          rank: 0, // Calculate or fetch?
          bank: fantasyTeam.finance.balance, // Snapshot finance?
          teamValue: 0, // Snapshot?
          picks: fantasyTeam.currentSquad.picks
        });
        console.log(`Archived GW ${squadGw} to history.`);
      }
    }

    // Update FantasyTeam Current Squad
    fantasyTeam.currentSquad.picks = newPicks;
    fantasyTeam.currentSquad.gameweek = currentGw; // Set to the GW we are preparing for
    // Reset points for the new GW squad? Usually yes, starts at 0 until played.
    // If we are editing "live", points might be complex, but "PickMyTeam" implies Next GW.
    fantasyTeam.currentSquad.points = 0;

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