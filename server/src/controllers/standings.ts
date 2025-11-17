
// Create sheets client


import { convertToJSON } from "../utils";
import { NextFunction, Request, Response } from "express";
import { StandingsResponse, TeamDetails } from "../types/standings";
import { convertToFormation } from "../lib/formatter/lineupFormatter";
import { getSheets } from "../lib/store/globals";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export const getStandings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getSheets()?.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Master Data!A:G", // Adjust range as needed
        });

        const rows = response?.data?.values || [];
        const standings: StandingsResponse[] = convertToJSON(rows, 'standings');
        
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.json({
            success: true,
            data: standings,
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

export const getTeamDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getSheets()?.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Master Data!H:X", // Adjust range as needed
        });

        const rows = response?.data?.values || [];
        const teamDetails: TeamDetails[] = convertToJSON(rows, 'teamDetails');
        const { teamName, gameWeek } = req.params;
        const propertyName = "team_name";
        const searchValue = decodeURI(teamName);
        let gw = parseInt(gameWeek);
        const currentGw = teamDetails[teamDetails.length - 1].gw;
        if (gw === 0) {
            gw = currentGw;
        }
        // Helper function to check if item is not a substitute
        const isNotSubstitute = (item: TeamDetails) => !item?.lineup?.toLowerCase().startsWith("sub ");
        // Helper function to get valid points
        const getValidPoints = (item: TeamDetails) => isNotSubstitute(item) ? item.point : 0;
        // Filter data once and reuse
        const filteredGWData = teamDetails.filter(
            (item: TeamDetails) => item[propertyName] === searchValue && item.gw === gw
        );
        const filteredData = teamDetails.filter(
            (item: TeamDetails) => item[propertyName] === searchValue
        );
        // Calculate total GW score
        const totalGWScore = filteredGWData.reduce(
            (acc, item: TeamDetails) => acc + getValidPoints(item),
            0
        );
        // Calculate average
        const avg = (
            filteredData.reduce((acc, item: TeamDetails) => acc + getValidPoints(item), 0) / currentGw
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
        const { starting, bench } = convertToFormation(filteredGWData)
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.json({
            success: true,
            data: {
                avg,
                highest,
                starting,
                bench,
                gw,
                currentGw,
                totalGWScore
            }
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