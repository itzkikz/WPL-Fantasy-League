
export interface StandingsResponse {
    current_gw: number,
    gw: number,
    last_update_date: string,
    pos_change: number,
    team: string,
    team_id: string,
    total: number,
    total_point_before_this_gw: number,
    manager?: string
}

export interface TeamDetails {
    gw: number,
    player_id?: number, // Added for ID tracking
    team_name: string,
    player_name: string,
    position: string,
    lineup: 'Starting XI' | 'SUB 1' | 'SUB 2' | 'SUB 3' | 'SUB 4',
    role: 'CAPTAIN' | 'VICE CAPTAIN' | null,
    club: string,
    point: number,
    team_short_name?: string,
    team_color?: string,
    team_text_color?: string,
    shirtNumber?: number;
    isStarting?: boolean;
    subNumber?: number;
    photo?: string;
    stats?: any;
}