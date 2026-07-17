export interface H2HLeagueTeam {
  _id: string;
  name: string;
}

export interface H2HLeague {
  _id: string;
  name: string;
  fantasyTeams: H2HLeagueTeam[];
  gameweekStart: number;
  gameweekEnd: number;
  season: number;
  isComplete: boolean;
  fixtureCount?: number;
  completedFixtures?: number;
  createdAt: string;
}

export interface H2HFixture {
  _id: string;
  league: string;
  homeTeam: H2HLeagueTeam;
  awayTeam: H2HLeagueTeam;
  gameweek: number;
  homeScore: number | null;
  awayScore: number | null;
  status: 'upcoming' | 'completed';
  winner: string | 'draw' | null;
}

export interface H2HStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  pts: number;
}
