/**
 * Application color theme
 * Central source of truth for colors used across the app
 */

// Primary Colors
export const PRIMARY = '#667eea'
export const PRIMARY_DARK = '#764ba2'
export const ACCENT = '#667eea'

// Neutral Colors
export const BACKGROUND_DARK = '#0f141a'
export const BACKGROUND_DARKER = '#1a1f2e'
export const SURFACE = 'rgba(26, 31, 46, 0.3)'
export const SURFACE_DARK = 'rgba(15, 20, 25, 0.3)'

// Text Colors
export const TEXT_PRIMARY = '#d0d8e0'
export const TEXT_SECONDARY = '#b0b8c1'
export const TEXT_MUTED = '#a8b2bb'
export const TEXT_HINT = '#7a8390'

// Status Colors
export const SUCCESS = '#4caf50'
export const SUCCESS_LIGHT = 'rgba(76, 175, 80, 0.15)'
export const ERROR = '#ff6b6b'
export const ERROR_LIGHT = 'rgba(211, 47, 47, 0.15)'
export const WARNING = '#ffa726'
export const INFO = '#29b6f6'

// Border Colors
export const BORDER_DEFAULT = 'rgba(102, 126, 234, 0.25)'
export const BORDER_LIGHT = 'rgba(102, 126, 234, 0.15)'
export const BORDER_FOCUS = 'rgba(102, 126, 234, 0.5)'

// Gradients
export const GRADIENT_PRIMARY = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
export const GRADIENT_GLASS = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'

// Shadow Colors
export const SHADOW_SM = '0 4px 12px rgba(0, 0, 0, 0.3)'
export const SHADOW_MD = '0 8px 32px rgba(0, 0, 0, 0.3)'
export const SHADOW_LG = '0 12px 40px rgba(102, 126, 234, 0.4)'

// Color Palettes for Data Visualization
export const PALETTE_BLUE = [
  '#667eea',
  '#5a67d8',
  '#4c51bf',
  '#4338ca',
  '#3730a3',
] as const

export const PALETTE_COLORFUL = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B88B',
  '#52C2B3',
  '#AED6F1',
  '#F8B1CB',
] as const

export const PALETTE_CHART = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#38f9d7',
  '#fa709a',
  '#fee140',
  '#30b0fe',
] as const

/**
 * Get color from palette by index
 */
export function getPaletteColor(palette: readonly string[], index: number): string {
  return palette[index % palette.length]
}

/**
 * Get contrasting text color for a background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  // Simple heuristic: if background is dark, use light text
  return backgroundColor.includes('#') && parseInt(backgroundColor.slice(1), 16) > 0x808080
    ? TEXT_SECONDARY
    : TEXT_PRIMARY
}

/**
 * Generate a color based on a string (for consistent coloring of dynamic items)
 */
export function stringToColor(str: string, palette: readonly string[] = PALETTE_COLORFUL): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  const index = Math.abs(hash) % palette.length
  return palette[index]
}

// Theme object for easy destructuring
export const THEME = {
  colors: {
    primary: PRIMARY,
    primaryDark: PRIMARY_DARK,
    accent: ACCENT,
    background: {
      dark: BACKGROUND_DARK,
      darker: BACKGROUND_DARKER,
    },
    surface: SURFACE,
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
      muted: TEXT_MUTED,
      hint: TEXT_HINT,
    },
    status: {
      success: SUCCESS,
      error: ERROR,
      warning: WARNING,
      info: INFO,
    },
    border: {
      default: BORDER_DEFAULT,
      light: BORDER_LIGHT,
      focus: BORDER_FOCUS,
    },
  },
  gradients: {
    primary: GRADIENT_PRIMARY,
    glass: GRADIENT_GLASS,
  },
  shadows: {
    sm: SHADOW_SM,
    md: SHADOW_MD,
    lg: SHADOW_LG,
  },
  palettes: {
    blue: PALETTE_BLUE,
    colorful: PALETTE_COLORFUL,
    chart: PALETTE_CHART,
  },
} as const
