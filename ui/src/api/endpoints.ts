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
    BY_TEAMNAME: (teamName: string, gameWeek: number) => `/standings/${teamName}/${gameWeek}`,
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
    SUBSCRIBE:'/notify/subscribe',
    // SUBSTITUTION: '/manager/sub'
    // BY_PLAYERNAME: (playerName: string) => `/players/${playerName}`,
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
} as const
