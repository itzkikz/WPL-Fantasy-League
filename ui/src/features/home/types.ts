import { Player } from "../players/types";

export interface TeamOverview {
  teamName: string;
  gameweek: number;
  gwPoints: number;
  totalPoints: number;
  rank: number;
  transfers: number;
  rankChange: number;
}

export interface GameweekProgress {
  teamSelected: boolean;
  transfersMade: boolean;
  captainChosen: boolean;
  teamConfirmed: boolean;
  deadline: string;
}

export interface UpcomingMatch {
  homeTeam: string;
  homeTeamShort: string;
  awayTeam: string;
  awayTeamShort: string;
  kickoffTime: string;
  gameweek: number;
}

export interface LeagueStats {
  totalPoints: number;
  overallRank: number;
  avgPointsPerGW: number;
  highestGW: number;
  teamValue: number;
}

export interface LeagueStanding {
  rank: number;
  team: string;
  gameweekPoints: number;
  totalPoints: number;
  rankChange: number;
}

export interface GameweekHistory {
  gameweek: number;
  points: number;
}

export interface TopPlayer {
  rank: number;
  name: string;
  team: string;
  position: string;
  points: number;
  ownedBy: number;
  photo?: string;
}

export interface PlayerSpotlightData {
  player: Player;
  gameweekPoints: number;
  gameweekRank: number;
  selectedBy: number;
  price: number;
  stats: {
    goals: number;
    assists: number;
    shots: number;
  };
}

export interface PointsBreakdown {
  goals: number;
  assists: number;
  cleanSheet: number;
  bonus: number;
  minutesPlayed: number;
  totalPoints: number;
}

export interface SeasonStats {
  avgPoints: number;
  totalPoints: number;
  highestPoints: number;
  totalRank: number;
}

export interface BestPerformer {
  rank: number;
  name: string;
  team: string;
  position: string;
  points: number;
  photo?: string;
}

export interface FixtureDifficultyItem {
  gameweek: number;
  opponent: string;
  home: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface SquadInfo {
  teamValue: number;
  inBank: number;
  bank: number;
}

export interface SquadComposition {
  goalkeepers: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  total: number;
}

export interface YourPlayer {
  name: string;
  team: string;
  points: number;
  price: number;
}

export interface HomePageData {
  teamOverview: TeamOverview;
  gameweekProgress: GameweekProgress;
  upcomingMatch: UpcomingMatch;
  leagueStats: LeagueStats;
  leagueStandings: LeagueStanding[];
  recentGameweeks: GameweekHistory[];
  topPlayers: TopPlayer[];
  playerSpotlight: PlayerSpotlightData;
  pointsBreakdown: PointsBreakdown;
  seasonStats: SeasonStats;
  bestPerformers: BestPerformer[];
  fixtureDifficulty: FixtureDifficultyItem[];
  squadInfo: SquadInfo;
  squadComposition: SquadComposition;
  yourPlayers: {
    goalkeepers: YourPlayer[];
    defenders: YourPlayer[];
    midfielders: YourPlayer[];
    forwards: YourPlayer[];
  };
  miniLeague: LeagueStanding[];
}
