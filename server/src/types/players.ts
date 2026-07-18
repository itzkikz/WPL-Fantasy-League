export interface SofaScoreStats {
  // Passing
  totalPass: number;
  accuratePass: number;
  totalLongBalls?: number;
  accurateLongBalls?: number;
  accurateOwnHalfPasses?: number;
  totalOwnHalfPasses?: number;
  accurateOppositionHalfPasses?: number;
  totalOppositionHalfPasses?: number;
  totalCross?: number;

  // Aerial
  aerialLost?: number;
  aerialWon?: number;

  // Duels
  duelLost: number;
  duelWon: number;

  // Challenges & Dribbles
  challengeLost?: number;
  dispossessed?: number;
  totalContest: number;
  wonContest: number;
  unsuccessfulTouch?: number;

  // Shooting
  onTargetScoringAttempt?: number;
  totalShots: number;
  goals: number;
  goalAssist: number;
  shotValueNormalized?: number;

  // Defense
  totalClearance?: number;
  clearanceOffLine?: number;
  outfielderBlock?: number;
  ballRecovery?: number;
  totalTackle: number;
  wonTackle?: number;

  // Fouls
  wasFouled: number;
  fouls: number;

  // Physical
  minutesPlayed: number;
  touches: number;
  possessionLostCtrl?: number;

  // Rating
  rating: number;
  ratingVersions?: { original: number; alternative: number };

  // Expected
  expectedGoals?: number;
  expectedGoalsOnTarget?: number;
  expectedAssists?: number;

  // Speed & Distance
  topSpeed?: number;
  kilometersCovered?: number;
  numberOfSprints?: number;
  metersCoveredWalkingKm?: number;
  metersCoveredJoggingKm?: number;
  metersCoveredRunningKm?: number;
  metersCoveredHighSpeedRunningKm?: number;
  metersCoveredSprintingKm?: number;

  // Goalkeeper-specific
  goodHighClaim?: number;
  savedShotsFromInsideTheBox?: number;
  saves: number;
  punches?: number;
  keeperSaveValue?: number;
  goalsPrevented?: number;
  goalkeeperValueNormalized?: number;

  // Value metrics
  defensiveValueNormalized?: number;
  passValueNormalized?: number;
  dribbleValueNormalized?: number;

  // Ball carries
  ballCarriesCount?: number;
  totalBallCarriesDistance?: number;
  totalProgression?: number;

  // Statistics type metadata
  statisticsType?: { sportSlug: string; statisticsType: string };

  // --- Computed fields ---
  appearances?: number;
  appearances60?: number;

  // --- Incident-derived fields (injected by sofascoreMapper) ---
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
  price: number;
  release_value: number;
  club: string;
  league: string;
  team_short_name: string;
  team_color: string;
  team_text_color: string;
  team_logo: string;
  player_id: number;
  current_week?: SofaScoreStats;
  photo?: string;
  ownership?: number;
  fantasy_team_name?: string | null;
  auctionPrice?: number;
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

export interface Player {
  id: number;
  name: string;
  webName?: string;
  slug?: string;
  shortName?: string;
  age?: number;
  number?: number;
  photo?: string;
  teamId: number;
  position?: string;
  positionsDetailed?: string[];
  weight?: number;
  jerseyNumber?: string;
  height?: number;
  dateOfBirth?: string;
  preferredFoot?: string;
  retired?: boolean;
  userCount?: number;
  deceased?: boolean;
  gender?: string;
  sofascoreId?: string;
  underage?: boolean;
  shirtNumber?: number;
  dateOfBirthTimestamp?: number;
  contractUntilTimestamp?: number;
  proposedMarketValue?: number;
  proposedMarketValueRaw?: {
    value?: number;
    currency?: string;
  };
  country?: {
    alpha2?: string;
    alpha3?: string;
    name?: string;
    slug?: string;
  };
  auctionPrice?: number;
}
