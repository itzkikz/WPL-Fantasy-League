// types.ts
export interface Player {
    id: number;
    name: string;
    team: string;
    teamColor: string;
    teamTextColor?: string;
    point: number;
    position: "GK" | "DEF" | "MID" | "FWD";
    isCaptain?: boolean;
    isViceCaptain?: boolean;
    isPowerPlayer?: boolean;
    fullTeamName: string;
    subNumber?: number;
    gw: number;
    shirtNumber?: number;
}
export interface Formation {
    GK: Player[];
    DEF: Player[];
    MID: Player[];
    FWD: Player[];
}
export interface FormationResult {
    starting: Formation;
    bench: Player[];
}
