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
    SUBSTITUTION: '/manager/sub'
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
    GAMEWEEKS: '/admin/gameweeks',
    COMPLETE_GAMEWEEK: (id: string | number) => `/admin/gameweeks/${id}/complete`,
    SEASONS: '/admin/seasons',
    PICK_TEAM_STATUS: '/admin/settings/pick-team',
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
  ADMIN_GAMEWEEKS: 'admin-gameweeks',
  ADMIN_SEASONS: 'admin-seasons',
  ADMIN_PICK_TEAM_STATUS: 'admin-pick-team-status',
} as const
