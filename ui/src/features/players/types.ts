// Standings related types
export interface Player {
    id: number;
    name: string;
    team: string;
    teamColor: string;
    point: number;
    position: string;
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
    isAvlSub?: boolean;
}

export interface PlayerStats {
    player_name: string,
    team_name: string,
    position: string,
    app: number,
    goal: number,
    assist: number,
    clean_sheet: number,
    save: number,
    red_card: number,
    yellow_card: number,
    penalty_miss: number,
    penalty_save: number,
    total_point: number,
    price: number,
    release_value: number
}