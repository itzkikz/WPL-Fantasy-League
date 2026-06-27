import { Player } from "../players/types"

// Standings related types
export interface Standings {
    current_gw: number,
    gw: number,
    last_update_date: string,
    pos_change: number,
    team: string,
    team_id: string,
    total: string,
    total_point_before_this_gw: string
}

export interface Formation {
    [key: string]: any;
    GK: Player[];
    DEF: Player[];
    MID: Player[];
    FWD: Player[];
}

export interface TeamDetails {
    starting: Formation;
    bench: Player[];
    totalGWScore: number,
    avg: number,
    highest: number,
    gw: number,
    gw: number,
    currentGw: number,
    team_name: string,
    team_id: string
}