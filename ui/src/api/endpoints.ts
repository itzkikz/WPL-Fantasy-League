// src/api/endpoints.ts
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },

  // Books endpoints
  STANDINGS: {
    BASE: '/standings',
    BY_TEAMNAME: (teamName: string) => `/standings/${teamName}`,
  },

  // Users endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile/update',
  },
} as const

// API Query Keys for TanStack Query
export const QUERY_KEYS = {
  STANDINGS: 'standings',
  USERS: 'users',
  USER_PROFILE: 'user-profile',
} as const
