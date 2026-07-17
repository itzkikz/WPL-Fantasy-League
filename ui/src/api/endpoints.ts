// src/api/endpoints.ts
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: 'login/',
    VALIDATE: 'validate-token/'
  },

  // Books endpoints
  STANDINGS: {
    BASE: '/standings',
    BY_TEAM_ID: (teamId: string, gameWeek: number) => `/standings/${teamId}/${gameWeek}`,
  },

  PLAYERS: {
    BASE: '/players',
    BY_PLAYERNAME: (playerName: string) => `/players/${playerName}`,
  },
  MANAGER: {
    BASE: '/manager',
    SUBSTITUTION: '/manager/sub',
    DASHBOARD: '/manager/dashboard',
    MY_FIXTURES: '/manager/my-fixtures',
    // BY_PLAYERNAME: (playerName: string) => `/players/${playerName}`,
  },
  NOTIFICATION: {
    BASE: '/notify/notifications',
    SUBSCRIBE: '/notify/subscribe',
    SEND: '/notify/send',
    // SUBSTITUTION: '/manager/sub'
  },
  ADMIN: {
    FIXTURES: '/admin/fixtures',
    UPDATE_FIXTURES: '/admin/fixtures/update',
    FETCH_MATCH_DETAILS: (id: string | number) => `/admin/fixtures/${id}/details`,
    FIXTURE_STATS: (id: string | number) => `/admin/fixtures/${id}/stats`,
    GAMEWEEKS: '/admin/gameweeks',
    COMPLETE_GAMEWEEK: (id: string | number) => `/admin/gameweeks/${id}/complete`,
    SEASONS: '/admin/seasons',
    PICK_TEAM_STATUS: '/admin/settings/pick-team',
    USERS: '/admin/users',
    FANTASY_TEAMS: '/admin/fantasy-teams',
    LEAGUES: '/admin/leagues',
    UPDATE_LEAGUE: (id: string) => `/admin/leagues/${id}`,
    H2H_LEAGUES: '/admin/h2h-leagues',
    H2H_LEAGUE: (id: string) => `/admin/h2h-leagues/${id}`,
    H2H_LEAGUE_FIXTURES: (id: string) => `/admin/h2h-leagues/${id}/fixtures`,
    H2H_GENERATE_FIXTURES: (id: string) => `/admin/h2h-leagues/${id}/generate-fixtures`,
  },
} as const

// API Query Keys for TanStack Query
export const QUERY_KEYS = {
  STANDINGS: 'standings',
  PLAYERS: 'players',
  AUTH: 'auth',
  USERS: 'users',
  MANAGER: 'manager',
  NOTIFICATIONS: 'notifications',
  ADMIN_FIXTURES: 'admin-fixtures',
  ADMIN_FIXTURE_STATS: 'admin-fixture-stats',
  ADMIN_GAMEWEEKS: 'admin-gameweeks',
  ADMIN_SEASONS: 'admin-seasons',
  ADMIN_PICK_TEAM_STATUS: 'admin-pick-team-status',
  ADMIN_LEAGUES: 'admin-leagues',
} as const
