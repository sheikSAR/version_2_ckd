/**
 * File handling constants
 * Defines accepted file types, extensions, and error messages
 */

export const ACCEPTED_EXTENSIONS = ['.json', '.yaml', '.yml', '.xlsx', '.xls'] as const
export const ACCEPTED_MIME_TYPES = 'application/json,.json,.yaml,.yml,.xlsx,.xls'

export const FILE_ERROR_MESSAGES = {
  INVALID_TYPE: 'Please upload a .json, .yaml, .yml, .xlsx, or .xls file.',
  INVALID_JSON: 'JSON file must contain an object.',
  PARSE_ERROR: 'Error parsing file. Please check the file format.',
  EMPTY_SHEET: 'Unable to parse Excel file. Make sure it contains data in the first two columns.',
} as const

export const FILE_TYPE_LABELS = {
  JSON: 'JSON',
  YAML: 'YAML',
  EXCEL: 'Excel',
} as const

export const PARSE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ROWS: 10000,
} as const
