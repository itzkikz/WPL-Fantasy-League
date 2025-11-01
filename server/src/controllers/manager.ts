import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { Users } from "../types/users";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { validateExecutedSwapAuto, validateSwapAuto } from "../lib/validators/substitution";
import { Substitution } from "../types/manager";
import { executeSwap } from "../lib/helpers/substitution";
import { buildSquadRows } from "../lib/helpers/subUpdate";
import { FormationResult } from "../lib/formatter/types";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;


export const details = async (req: Request, res: Response, next: NextFunction) => {
  const response = await getSheets()?.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Pick Team!A:G", // Adjust range as needed
  });

  const currentGW = req.user.gw;
  const nextGW = currentGW + 1;

  const rowsPickTeam = response?.data?.values || [];
  const teamDetails: TeamDetails[] = convertToJSON(rowsPickTeam, 'teamDetails');
  const propertyName = "team_name";
  const searchValue = decodeURI(req.user.userId);

  let filteredGWData = teamDetails.filter(
    (item: TeamDetails) => item[propertyName] === searchValue && item.gw === nextGW
  );
  if (filteredGWData?.length === 0) {
    const response = await getSheets()?.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master Data!H:X", // Adjust range as needed
    });

    const rows = response?.data?.values || [];
    const teamDetails: TeamDetails[] = convertToJSON(rows, 'teamDetails');
    const propertyName = "team_name";
    const searchValue = decodeURI(req.user.userId);

    filteredGWData = teamDetails.filter(
      (item: TeamDetails) => item[propertyName] === searchValue && item.gw === currentGW
    );
  }
  const { starting, bench } = convertToFormation(filteredGWData);





  res.json({
    success: true,
    data: {
      starting,
      bench,
    }
  });
}

export const substitution = async (req: Request, res: Response, next: NextFunction) => {
  const { substitution } = req.body;
  const response = await getSheets()?.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Pick Team!A:G", // Adjust range as needed
  });
  const currentGW = req.user.gw;
  const nextGW = req.user.gw + 1;

  const rowsPickTeam = response?.data?.values || [];
  const teamDetails: TeamDetails[] = convertToJSON(rowsPickTeam, 'teamDetails');
  const propertyName = "team_name";
  const teamName = decodeURI(req.user.userId);

  let filteredGWData = teamDetails.filter(
    (item: TeamDetails) => item[propertyName] === teamName && item.gw === nextGW
  );
  if (filteredGWData?.length === 0) {
    const response = await getSheets()?.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master Data!H:X", // Adjust range as needed
    });

    const rows = response?.data?.values || [];
    const teamDetails: TeamDetails[] = convertToJSON(rows, 'teamDetails');
    const propertyName = "team_name";

    filteredGWData = teamDetails.filter(
      (item: TeamDetails) => item[propertyName] === teamName && item.gw === currentGW
    );
  }
  const { starting, bench } = convertToFormation(filteredGWData)


  let swappedData: any = {};
  console.log(starting, bench, swappedData, swappedData)
  const invalid = substitution.map((val: Substitution) => {
    const res = validateSwapAuto({ starting, bench }, val.swapIn, val.swapOut);
    console.log(res);
    if (!res.ok) {
      return !res.ok;
    } else {
      swappedData = executeSwap({ starting: swappedData?.starting || starting, bench: swappedData?.bench || bench }, val?.swapIn?.name, val?.swapOut?.name);
      return false;
      // console.log(executeSwap({ starting, bench }, val?.swapIn?.name, val?.swapOut?.name))
    }
  });


  if (invalid.includes(true)) {
    return res.status(403).json({ data: { message: 'One or more substitutions are not allowed' } });
  }


  const updateRows = swappedData.starting && buildSquadRows(swappedData, teamName, nextGW);

  const updates: any = [];

  rowsPickTeam.forEach((r, i) => {
    console.log(r[1], teamName, r[0], nextGW)
    if (r[1] === teamName && parseInt(r[0]) === nextGW) {
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
    // console.log('Updated cells:', write?.data);
    res.json({
      data: {
        message: updateRows,
        updated: write?.data
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
    // console.log('Appended range:', appendRes?.data);
    // return { updated: 0, appended: 1 };

    res.json({
      data: {
        message: appendRes?.data
      }
    });
  }


}