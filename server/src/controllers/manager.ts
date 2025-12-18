import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { User } from "../models/User";
import { FantasyTeam } from "../models/FantasyTeam";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { validateAndApplySwap } from "../lib/validators/substitution";
import { Substitution } from "../types/manager";
import { executeSwap } from "../lib/helpers/substitution";
import { buildSquadRows } from "../lib/helpers/subUpdate";
import { FormationResult } from "../lib/formatter/types";
import { sheets_v4 } from "googleapis";
import { setCaptain, setViceCaptain } from "../lib/helpers/roleUpdate";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
type Cell = string | number | boolean | null;
type Row = Cell[];

export const details = async (req: Request, res: Response, next: NextFunction) => {
  const teamName = req.user.userId;
  const propertyName = "team_name";
  const batchDetails = await getSheets()?.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: [
      'Pick Team!A:G',
      'Master Data!H:O',
      'Master Data!B:G'
    ],
    majorDimension: 'ROWS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  });

  const valueRanges: sheets_v4.Schema$ValueRange[] = batchDetails?.data.valueRanges ?? [];

  const pickteamRows: Row[] = (valueRanges[0].values as Row[]) ?? []; // 2D array
  const detailsRows: Row[] = (valueRanges[1].values as Row[]) ?? []; // 2D array
  const standingsRows: Row[] = (valueRanges[2].values as Row[]) ?? []; // 2D array

  const teamDetails: TeamDetails[] = convertToJSON(detailsRows, 'teamDetails');
  const standings: StandingsResponse[] = convertToJSON(standingsRows, 'standings');
  const pickTeamDetails: TeamDetails[] = convertToJSON(pickteamRows, 'teamDetails');

  // 1. Find the User
  const user = await User.findOne({ username: teamName });
  if (!user) {
    console.log(`[Manager Details] User not found: ${teamName}`);
    return res.status(404).json({ error: 'User not found' });
  }

  // 2. Find the FantasyTeam managed by this user
  // Strategy: Use the first team in managedTeams, or search FantasyTeam by managers
  // Fallback: If managedTeams is empty, search by 'managers' field in FantasyTeam
  let fantasyTeam = await FantasyTeam.findOne({
    $or: [
      { _id: { $in: user.managedTeams } }, // If user has references
      { managers: user._id }               // If team has references
    ]
  }).populate('managers', 'username'); // Populate managers to get names

  if (!fantasyTeam) {
    console.log(`[Manager Details] FantasyTeam not found for user: ${teamName}`);
    return res.status(404).json({ error: 'Fantasy Team not found' });
  }

  const { deadline, currentGw, pickMyTeam, finance } = fantasyTeam;
  const { totalBudget, utilisation, balance } = finance; // Extract from finance sub-document

  // Transform managers ObjectId[] (populated) to string[]
  const managersList = (fantasyTeam.managers as any[]).map(m => m.username);

  const gw = currentGw; // Map currentGw to gw

  const nextGw = gw;

  const rank = standings.findIndex(item => item.team === teamName) + 1;
  const teamStanding = standings.find(item => item.team === teamName);
  const { total, total_point_before_this_gw } = teamStanding || {};

  const pickTeamDetailsNextGW = pickTeamDetails.filter(
    (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGw
  );

  let managerTeam: FormationResult;


  if (pickTeamDetailsNextGW?.length > 0) {
    managerTeam = convertToFormation(pickTeamDetailsNextGW);
  } else {
    const teamDetailsGW = teamDetails.filter(
      (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGw
    );
    managerTeam = convertToFormation(teamDetailsGW);
  }




  // Helper function to check if item is not a substitute
  const isNotSubstitute = (item: TeamDetails) => !item?.lineup?.toLowerCase().startsWith("sub ");
  // Helper function to get valid points
  const getValidPoints = (item: TeamDetails) => isNotSubstitute(item) ? item.point : 0;
  // Filter data once and reuse
  const filteredGWData = teamDetails.filter(
    (item: TeamDetails) => item[propertyName] === teamName && item.gw === gw
  );
  const filteredData = teamDetails.filter(
    (item: TeamDetails) => item[propertyName] === teamName
  );
  // Calculate total GW score
  const totalGWScore = filteredGWData.reduce(
    (acc, item: TeamDetails) => acc + getValidPoints(item),
    0
  );
  // Calculate average
  const avg = (
    filteredData.reduce((acc, item: TeamDetails) => acc + getValidPoints(item), 0) / (gw || 1)
  ).toFixed(2);
  // Calculate highest score by gameweek
  const gwScores = filteredData.reduce((acc: Record<number, number>, item: TeamDetails) => {
    if (isNotSubstitute(item)) {
      const gameweek = item.gw;
      acc[gameweek] = (acc[gameweek] || 0) + item.point;
    }
    return acc;
  }, {} as Record<number, number>);

  const highest = Math.max(...Object.values(gwScores));

  return res.json({
    data: {
      deadline,
      gw,
      pickMyTeam,
      avg,
      highest,
      total,
      total_point_before_this_gw,
      totalGWScore,
      teamsCount: standings?.length,
      rank,
      managerTeam,
      team: teamName,
      utlisation: utilisation,
      total_budget: totalBudget, // Return mapped field
      balance,
      managers: managersList // Return string[]
    }
  });
}

export const substitution = async (req: Request, res: Response, next: NextFunction) => {
  const { substitution, roles } = req.body;

  const teamName = req.user.userId;
  const propertyName = "team_name";
  const batchDetails = await getSheets()?.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: [
      'Pick Team!A:G',
      'Master Data!H:O',
    ],
    majorDimension: 'ROWS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  });

  const valueRanges: sheets_v4.Schema$ValueRange[] = batchDetails?.data.valueRanges ?? [];

  const pickteamRows: Row[] = (valueRanges[0].values as Row[]) ?? []; // 2D array
  const detailsRows: Row[] = (valueRanges[1].values as Row[]) ?? []; // 2D array

  const user = await User.findOne({ username: teamName });
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

  const { deadline, currentGw, pickMyTeam } = fantasyTeam;
  const gw = currentGw;
  const pickmyteam = pickMyTeam;


  if (pickmyteam) {

    const teamDetails: TeamDetails[] = convertToJSON(detailsRows, 'teamDetails');
    const pickTeamDetails: TeamDetails[] = convertToJSON(pickteamRows, 'teamDetails');

    const nextGw = gw;


    const pickTeamDetailsNextGW = pickTeamDetails.filter(
      (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGw
    );

    let managerTeam: FormationResult;


    if (pickTeamDetailsNextGW?.length > 0) {
      managerTeam = convertToFormation(pickTeamDetailsNextGW);
    } else {
      const teamDetailsGW = teamDetails.filter(
        (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGw
      );
      managerTeam = convertToFormation(teamDetailsGW);
    }

    const { starting, bench } = managerTeam;


    let swappedData: any = {};
    if (substitution?.length > 0) {
      const invalid = substitution.map((val: Substitution) => {
        swappedData = validateAndApplySwap({ starting: swappedData?.starting || starting, bench: swappedData?.bench || bench }, val.swapIn.name, val.swapOut.name);
        if (!swappedData.ok) {
          return !swappedData.ok;
        }
        return false
      });


      if (invalid.includes(true)) {
        return res.status(403).json({ data: { message: 'One or more substitutions are not allowed' } });
      }
    }

    let roleUpdate: any = {};
    if (roles && roles?.captain) {
      roleUpdate = setCaptain(
        { starting: roleUpdate?.starting || swappedData.starting || starting, bench: roleUpdate?.bench || swappedData.bench || bench },
        roles?.captain
      );
    }
    if (roles && roles?.vice) {
      roleUpdate = setViceCaptain(
        { starting: roleUpdate?.starting || swappedData.starting || starting, bench: roleUpdate?.bench || swappedData.bench || bench },
        roles?.vice
      );
    }

    if (Object.keys(roleUpdate)?.length > 0) {
      swappedData = roleUpdate;
    }

    const updateRows = swappedData.starting && buildSquadRows(swappedData, teamName, nextGw);

    const updates: any = [];

    let dataIndex = 0;
    pickteamRows.forEach((r, i) => {
      if (r[1] === teamName && r[0] === nextGw) {
        const rowIndex = i + 1; // account for header row A1
        updates.push({
          range: `${'Pick Team'}!A${rowIndex}`,
          values: [updateRows[dataIndex]]
        });
        dataIndex++
      }
    });

    // 2a) If matches, batch update those cells
    if (updates.length) {
      const write = await getSheets()?.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates
        }
      });
      res.json({
        data: {
          message: "Team Updated !"
        }
      });
      // return { updated: updates.length, appended: 0 };
    } else {
      // 2b) If no matches, append a new row at the bottom
      const appendRes = await getSheets()?.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${'Pick Team'}!A:D`,               // anchor the table; appends after last row
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: updateRows
        }
      });

      res.json({
        data: {
          message: "Team Updated !"
        }
      });
    }
  } else {
    res.status(403).json({
      data: {
        message: "Pick My Team is not open"
      }
    });
  }



}