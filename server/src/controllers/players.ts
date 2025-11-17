import { NextFunction, Request, Response } from "express";
import { convertToJSON } from "../utils";
import { PlayerStats } from "../types/players";
import { getSheets } from "../lib/store/globals";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getSheets()?.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Players!A:Q", // Adjust range as needed
        });
        const rows = response?.data?.values || [];
        const playerStats: PlayerStats[] = convertToJSON(rows, 'playerStats');
        const { playerName } = req.params;
        const propertyName = "player_name";
        const searchValue = decodeURI(playerName);

        const filteredData = playerStats.find((item: PlayerStats) => {
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

export const getFullPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getSheets()?.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Players!A:Q", // Adjust range as needed
        });
        const rows = response?.data?.values || [];
        const playerStats: PlayerStats[] = convertToJSON(rows, 'playerStats').sort((a, b) => b?.total_point - a?.total_point);

        res.json({
            success: true,
            data: playerStats,
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