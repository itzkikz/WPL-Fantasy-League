
export interface StandingsResponse {
    current_gw: number,
    gw: number,
    last_update_date: string,
    pos_change: number,
    team: string,
    total: number,
    total_point_before_this_gw: number
}

export interface TeamDetails {
    gw: number,
    team_name: string,
    player_name: string,
    position: string,
    lineup: 'Starting XI' | 'SUB 1' | 'SUB 2' | 'SUB 3' | 'SUB 4',
    role: 'CAPTAIN' | 'VICE CAPTAIN' | null,
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