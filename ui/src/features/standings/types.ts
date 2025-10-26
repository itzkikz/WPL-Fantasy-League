import { PlayerLineup } from "../players/types"

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

export interface TeamDetails {
    playerData: PlayerLineup[],
    totalGWScore: number,
    avg: number,
    highest: number,
    gw: number,
    currentGw: number
}