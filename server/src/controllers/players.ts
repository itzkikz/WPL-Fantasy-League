import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import fs from 'fs'
import { convertToJSON } from "../utils";
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { PlayerStats } from "../types/players";


const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf8"));

// Configure Google Auth
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Master Data!Z:AM", // Adjust range as needed
        });

        const rows = response?.data?.values || [];

        const playerStats: PlayerStats[] = convertToJSON(rows, 'playerStats');

        const { playerName } = req.params;

        const propertyName = "player_name";
        const searchValue = decodeURI(playerName);

        const filteredData = playerStats.filter((item: PlayerStats) => {
            return item[propertyName] === searchValue;
        });

        res.json({
            success: true,
            data: filteredData,
        });
    } catch (error: unknown) {
        console.error("Error reading data:", error);
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        } else {
            res.status(500).json({
                success: false,
                error: error,
            });
        }

    }
}