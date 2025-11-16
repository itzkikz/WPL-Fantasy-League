// formationConverter.ts
import { teamsData } from '../data/teamsData';

const { teams } = teamsData;

// Position mapping
const positionMap: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
    G: "GK",
    D: "DEF",
    M: "MID",
    F: "FWD",
};

// Helper function to get team data
export const getTeamData = (clubName: string) => {
    const teamData = teams[clubName as keyof typeof teams];
    return {
        abbreviation: teamData?.abbreviation || clubName?.substring(0, 3).toUpperCase(),
        color: teamData?.color || "#000000"
    };
};

// Helper function to map position
export const mapPosition = (pos: string): "GK" | "DEF" | "MID" | "FWD" => {
    return positionMap[pos] || (pos as "GK" | "DEF" | "MID" | "FWD");
};

