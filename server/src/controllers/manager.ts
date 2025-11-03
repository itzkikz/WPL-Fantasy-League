import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { Users } from "../types/users";
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
      'Users!A:G',
      'Pick Team!A:G',
      'Master Data!H:O',
      'Master Data!B:G'
    ],
    majorDimension: 'ROWS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  });

  const valueRanges: sheets_v4.Schema$ValueRange[] = batchDetails?.data.valueRanges ?? [];

  const usersRows: Row[] = (valueRanges[0].values as Row[]) ?? []; // 2D array
  const pickteamRows: Row[] = (valueRanges[1].values as Row[]) ?? []; // 2D array
  const detailsRows: Row[] = (valueRanges[2].values as Row[]) ?? []; // 2D array
  const standingsRows: Row[] = (valueRanges[3].values as Row[]) ?? []; // 2D array

  const users: Users[] = convertToJSON(usersRows, 'users');
  const teamDetails: TeamDetails[] = convertToJSON(detailsRows, 'teamDetails');
  const standings: StandingsResponse[] = convertToJSON(standingsRows, 'standings');
  const pickTeamDetails: TeamDetails[] = convertToJSON(pickteamRows, 'teamDetails');

  const manager = users.find((val) => val?.username === teamName)
  const { deadline, gw, pickmyteam } = manager || { gw: 0 };
  const nextGw = gw + 1;

  const rank = standings.findIndex(item => item.team === teamName) + 1;
  const teamStanding = standings.find(item => item.team === teamName);
  const { total, total_point_before_this_gw } = teamStanding || {};

  const pickTeamDetailsNextGW = pickTeamDetails.filter(
    (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGw
  );

  let managerTeam: FormationResult;
   console.log(pickTeamDetailsNextGW)


  if (pickTeamDetailsNextGW?.length > 0) {
    managerTeam = convertToFormation(pickTeamDetailsNextGW);
  } else {
    const teamDetailsGW = teamDetails.filter(
      (item: TeamDetails) => item[propertyName] === teamName && item.gw === gw
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
      pickMyTeam: pickmyteam,
      avg,
      highest,
      total,
      total_point_before_this_gw,
      totalGWScore,
      teamsCount: standings?.length,
      rank,
      managerTeam,
      team: teamName
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
      'Users!A:G',
      'Pick Team!A:G',
      'Master Data!H:O',
    ],
    majorDimension: 'ROWS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  });

  const valueRanges: sheets_v4.Schema$ValueRange[] = batchDetails?.data.valueRanges ?? [];

  const usersRows: Row[] = (valueRanges[0].values as Row[]) ?? []; // 2D array



  const pickteamRows: Row[] = (valueRanges[1].values as Row[]) ?? []; // 2D array
  const detailsRows: Row[] = (valueRanges[2].values as Row[]) ?? []; // 2D array

  const users: Users[] = convertToJSON(usersRows, 'users');
  const manager = users.find((val) => val?.username === teamName)

  const { deadline, gw, pickmyteam } = manager || { gw: 0 };


  if (pickmyteam) {

    const teamDetails: TeamDetails[] = convertToJSON(detailsRows, 'teamDetails');
    const pickTeamDetails: TeamDetails[] = convertToJSON(pickteamRows, 'teamDetails');

    const nextGw = gw + 1;


    const pickTeamDetailsNextGW = pickTeamDetails.filter(
      (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGw
    );

    let managerTeam: FormationResult;


    if (pickTeamDetailsNextGW?.length > 0) {
      managerTeam = convertToFormation(pickTeamDetails);
    } else {
      const teamDetailsGW = teamDetails.filter(
        (item: TeamDetails) => item[propertyName] === teamName && item.gw === gw
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

    if (roleUpdate) {
      swappedData = roleUpdate;
    }


    const updateRows = swappedData.starting && buildSquadRows(swappedData, teamName, nextGw);

    const updates: any = [];

    pickteamRows.forEach((r, i) => {
      if (r[1] === teamName && r[0] === nextGw) {
        const rowIndex = i + 1; // account for header row A1
        updates.push({
          range: `${'Pick Team'}!A${rowIndex}`,
          values: [updateRows[rowIndex - 2]]
        });
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