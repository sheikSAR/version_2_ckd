/**
 * Shared types used across the application
 */

// File and Configuration Types
export type FileFormat = 'json' | 'yaml' | 'excel'
export type ConfigurationData = Record<string, Record<string, string>>

// User and Authentication Types
export type UserRole = 'user' | 'admin' | 'configurator'

// Graph and Visualization Types
export interface PatientEdge {
  [key: string]: string
}

export interface GraphNode {
  id: string
  label: string
  color?: string
  size?: number
}

export interface GraphEdge {
  source: string
  target: string
  label?: string
  weight?: number
}

// Component Props
export interface CardProps {
  children: React.ReactNode
  className?: string
}

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export interface AlertProps {
  message: string
  type?: 'error' | 'warning' | 'success' | 'info'
  className?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginResponse {
  success: boolean
  role: UserRole
  message?: string
}

export interface SessionResponse {
  success: boolean
  sessionId?: string
  message?: string
}
