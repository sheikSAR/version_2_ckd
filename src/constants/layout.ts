/**
 * Layout constants
 * Shared spacing, sizing, and layout values across the app
 */

export const SPACING = {
  XS: '8px',
  SM: '12px',
  MD: '16px',
  LG: '20px',
  XL: '24px',
  XXL: '32px',
  XXXL: '40px',
} as const

export const BORDER_RADIUS = {
  SM: '8px',
  MD: '10px',
  LG: '12px',
  XL: '16px',
  FULL: '999px',
} as const

export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 10,
  NAVBAR: 30,
  MODAL: 40,
  TOOLTIP: 50,
} as const

export const BREAKPOINTS = {
  MOBILE: '600px',
  TABLET: '768px',
  DESKTOP: '1024px',
} as const

export const ANIMATION = {
  DURATION_FAST: '0.2s',
  DURATION_BASE: '0.3s',
  DURATION_SLOW: '0.8s',
  EASING_DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const
