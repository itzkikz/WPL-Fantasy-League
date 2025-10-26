// Standings related types
export interface PlayerLineup {
    gw: number,
    team_name: string,
    player_name: string,
    position: string,
    lineup: string,
    role: string,
    club: string,
    point: number,
    app: number,
    goal: number,
    assist: number,
    clean_sheet: number,
    save: number,
    red_card: number,
    yellow_card: number,
    penalty_miss: number,
    penalty_save: number
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
    price: number
}