// Standings related types
export interface Player {
    id: number;
    name: string;
    team: string;
    teamColor: string;
    teamTextColor?: string;
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
    shirtNumber?: number;
    photo?: string;
}

export interface PlayerMatchStat {
    games: {
        minutes: number | null;
        number: number | null;
        position: string;
        rating: string | null;
        captain: boolean;
        substitute: boolean;
        cleansheet: boolean | null;
        appearances?: number;
    };
    offsides: number | null;
    shots: {
        total: number | null;
        on: number | null;
    };
    goals: {
        total: number | null;
        conceded: number | null;
        assists: number | null;
        saves: number | null;
    };
    passes: {
        total: number | null;
        key: number | null;
        accuracy: string | null;
    };
    tackles: {
        total: number | null;
        blocks: number | null;
        interceptions: number | null;
    };
    duels: {
        total: number | null;
        won: number | null;
    };
    dribbles: {
        attempts: number | null;
        success: number | null;
        past: number | null;
    };
    fouls: {
        drawn: number | null;
        committed: number | null;
    };
    cards: {
        yellow: number | null;
        red: number | null;
    };
    penalty: {
        won: number | null;
        commited: number | null;
        scored: number | null;
        missed: number | null;
        saved: number | null;
    };
    total_point?: number;
    point?: number;
}

export interface PlayerStats {
    player_name: string;
    team_name: string;
    position: string;
    overall: PlayerMatchStat;
    current_week?: PlayerMatchStat;
    price: number;
    release_value: number,
    club: string;
    league: string;
    team_short_name: string;
    team_color: string;
    team_text_color: string;
    player_id: number;
    photo?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        totalPlayers: number;
        totalPages: number;
        hasNextPage: boolean;
    };
}

export interface PlayerFilters {
    clubs?: string[];
    leagues?: string[];
    positions?: string[];
    freeAgents?: boolean;
}

export interface PlayerFilterOptions {
    clubs: string[];
    leagues: string[];
}