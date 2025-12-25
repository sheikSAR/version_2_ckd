/**
 * API Base URL and Endpoints
 * Uses VITE_API_BASE environment variable, defaults to localhost:5000
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE}/login`,
  CREATE_SESSION: `${API_BASE}/configurator/create-session`,
} as const

export const API_CONFIG = {
  BASE_URL: API_BASE,
  TIMEOUT: 30000,
} as const
