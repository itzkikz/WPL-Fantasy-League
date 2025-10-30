import { Player } from "../players/types"

// Standings related types
export interface Standings {
    current_gw: number,
    gw: number,
    last_update_date: string,
    pos_change: number,
    team: string,
    total: string,
    total_point_before_this_gw: string
}

export interface Formation {
    [key: string ]: any;
    goalkeeper: Player[];
    defenders: Player[];
    midfielders: Player[];
    forwards: Player[];
}

export interface TeamDetails {
    starting: Formation;
    bench: Player[];
    totalGWScore: number,
    avg: number,
    highest: number,
    gw: number,
    currentGw: number
}