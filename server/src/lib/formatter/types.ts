// types.ts
export interface Player {
    id: number;
    name: string;
    team: string;
    teamColor: string;
    point: number;
    position: "GK" | "DEF" | "MID" | "FWD";
    isCaptain?: boolean;
    isViceCaptain?: boolean;
    isPowerPlayer?: boolean;
    fullTeamName: string;
    subNumber?: number;
    clean_sheet: number;
    goal: number;
    assist: number;
    yellow_card: number;
    red_card: number;
    save: number;
    penalty_save: number;
    penalty_miss: number;
    app: number;
    gw: number;
}
export interface Formation {
    goalkeeper: Player[];
    defenders: Player[];
    midfielders: Player[];
    forwards: Player[];
}
export interface FormationResult {
    starting: Formation;
    bench: Player[];
}
