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

export interface SofaScoreStats {
  totalPass: number;
  accuratePass: number;
  totalLongBalls?: number;
  accurateLongBalls?: number;
  accurateOwnHalfPasses?: number;
  totalOwnHalfPasses?: number;
  accurateOppositionHalfPasses?: number;
  totalOppositionHalfPasses?: number;
  totalCross?: number;
  aerialLost?: number;
  aerialWon?: number;
  duelLost: number;
  duelWon: number;
  challengeLost?: number;
  dispossessed?: number;
  totalContest: number;
  wonContest: number;
  unsuccessfulTouch?: number;
  onTargetScoringAttempt?: number;
  totalShots: number;
  goals: number;
  goalAssist: number;
  shotValueNormalized?: number;
  totalClearance?: number;
  clearanceOffLine?: number;
  outfielderBlock?: number;
  ballRecovery?: number;
  totalTackle: number;
  wonTackle?: number;
  wasFouled: number;
  fouls: number;
  minutesPlayed: number;
  touches: number;
  possessionLostCtrl?: number;
  rating: number;
  ratingVersions?: { original: number; alternative: number };
  expectedGoals?: number;
  expectedGoalsOnTarget?: number;
  expectedAssists?: number;
  topSpeed?: number;
  kilometersCovered?: number;
  numberOfSprints?: number;
  metersCoveredWalkingKm?: number;
  metersCoveredJoggingKm?: number;
  metersCoveredRunningKm?: number;
  metersCoveredHighSpeedRunningKm?: number;
  metersCoveredSprintingKm?: number;
  goodHighClaim?: number;
  savedShotsFromInsideTheBox?: number;
  saves: number;
  punches?: number;
  keeperSaveValue?: number;
  goalsPrevented?: number;
  goalkeeperValueNormalized?: number;
  defensiveValueNormalized?: number;
  passValueNormalized?: number;
  dribbleValueNormalized?: number;
  ballCarriesCount?: number;
  totalBallCarriesDistance?: number;
  totalProgression?: number;
  statisticsType?: { sportSlug: string; statisticsType: string };
  appearances?: number;
  appearances60?: number;
  substitute: boolean;
  yellowCards: number;
  redCards: number;
  goalsConceded: number;
  cleanSheet: number;
  penaltyWon: number;
  penaltyCommitted: number;
  penaltyScored: number;
  penaltyMissed: number;
  penaltySaved: number;
  offsides: number;
}

export interface PlayerStats {
    player_name: string;
    team_name: string;
    position: string;
    overall: SofaScoreStats;
    current_week?: SofaScoreStats;
    price: number;
    release_value: number;
    club: string;
    league: string;
    team_short_name: string;
    team_color: string;
    team_text_color: string;
    player_id: number;
    photo?: string;
    ownership?: number;
    fantasy_team_name?: string | null;
    upcoming_fixtures?: {
      gw: number;
      opponent_short_name: string;
      opponent_logo: string;
      opponent_color: string;
      opponent_text_color: string;
      my_team_short_name: string;
      my_team_logo: string;
      is_home: boolean;
    }[];
    recent_form?: {
      gw: number;
      points: number;
    }[];
    points_breakdown?: {
      label: string;
      value: string;
      points: number;
    }[];
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
