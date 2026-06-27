export interface PlayerStats {
    player_name: string,
    team_name: string,
    position: string,
    overall: PlayerMatchStat;
    price: number,
    release_value: number,
    club: string,
    league: string;
    team_short_name: string;
    team_color: string;
    team_text_color: string;
    player_id: number;
    current_week?: PlayerMatchStat;
    photo?: string;
}

export interface Player {
    id: number;
    name: string;
    webName?: string;
    firstName?: string;
    lastName?: string;
    age: number;
    number: number;
    position: string;
    photo: string;
    teamId: number;
}

export interface PlayerMatchStat {
    total_point?: number;
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
}