# Project Structure and Architecture Guide

## Overview
This document describes the refactored project structure, standards, and best practices for maintaining clean, organized, and scalable code.

## Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # Low-level UI primitives (buttons, inputs, etc.)
│   │   └── particle-text-effect.tsx
│   ├── FileUploadMode.tsx
│   ├── ManualEntryMode.tsx
│   ├── ConfiguratorNavbar.tsx
│   ├── PageLayout.tsx
│   └── ...
├── pages/                  # Route-level components (one per page)
│   ├── LoginPage.tsx
│   ├── ConfiguratorPage.tsx
│   ├── DataGraphPage.tsx
│   └── ...
├── styles/                 # Global and component-scoped styles
│   ├── shared.css         # Shared styles, animations, CSS variables
│   ├── LoginPage.css
│   ├── ConfiguratorPage.css
│   └── ...
├── constants/              # Application constants
│   ├── api.ts             # API endpoints and configuration
│   ├── files.ts           # File handling constants
│   └── layout.ts          # Layout, spacing, and animation constants
├── theme/                  # Design system and theme
│   └── colors.ts          # Color palettes and theme utilities
├── types/                  # TypeScript types and interfaces
│   └── index.ts
├── utils/                  # Utility functions
│   ├── fileParsers.ts     # Centralized file parsing logic
│   └── patientNodeMapper.ts
├── hooks/                  # Custom React hooks
│   └── useScrollAnimation.ts
├── index.css              # Main global styles (imports shared.css)
├── main.tsx               # Application entry point
└── App.tsx                # Root component and routing
```

## Key Improvements

### 1. Constants Organization
All hardcoded values are centralized in `/src/constants/`:

- **api.ts**: API endpoints and configuration
  ```typescript
  import { API_ENDPOINTS } from '../constants/api'
  // Usage: axios.post(API_ENDPOINTS.LOGIN, {...})
  ```

- **files.ts**: File handling constants
  ```typescript
  import { ACCEPTED_MIME_TYPES, FILE_ERROR_MESSAGES } from '../constants/files'
  ```

- **layout.ts**: Layout and spacing constants
  ```typescript
  import { SPACING, BORDER_RADIUS, Z_INDEX } from '../constants/layout'
  ```

### 2. Theme and Colors
Centralized in `/src/theme/colors.ts`:

- Color palettes for data visualization
- CSS color utilities
- Helper functions for color management
- Theme object for easy access

**CSS Variables** in `styles/shared.css`:
```css
:root {
  --color-primary: #667eea;
  --color-text-primary: #d0d8e0;
  /* ... etc */
}
```

Usage in components:
```css
.button {
  background: var(--color-primary);
  color: var(--color-text-primary);
}
```

### 3. Shared Styles
All common styles consolidated in `styles/shared.css`:

- CSS variables (colors, spacing, animations)
- Global reset and base styles
- Common animations (fadeInUp, slideIn, etc.)
- Shared components (.error-message, .success-message)
- Scrollbar styling

### 4. Centralized File Parsing
All file parsing logic in `/src/utils/fileParsers.ts`:

```typescript
import { parseFile, isValidFileExtension } from '../utils/fileParsers'

// Automatically detects file type and parses accordingly
const data = await parseFile(file)
```

Benefits:
- Single source of truth for file handling
- Consistent error messages
- DRY principle applied
- Easier to maintain and extend

### 5. Type Safety
Shared types in `/src/types/index.ts`:

```typescript
export type ConfigurationData = Record<string, Record<string, string>>
export type UserRole = 'user' | 'admin' | 'configurator'
export interface PatientEdge { ... }
```

Usage:
```typescript
import { ConfigurationData, UserRole } from '../types'

const [data, setData] = useState<ConfigurationData>({})
```

## Naming Conventions

### Components
- **PascalCase** for component filenames: `LoginPage.tsx`, `FileUploadMode.tsx`
- **PascalCase** for component exports
- **camelCase** for component props

### Styles
- **kebab-case** for CSS class names: `.login-card`, `.error-message`
- **Namespace** classes to avoid conflicts: `.login-button`, `.file-upload-section`
- **No inline styles** unless absolutely necessary

### Constants
- **UPPER_SNAKE_CASE** for constant values: `API_BASE_URL`, `ACCEPTED_EXTENSIONS`
- **Group related constants** in dedicated files
- **Use `as const`** for TypeScript literal types

### Functions
- **camelCase** for function names: `parseFile()`, `stringToColor()`
- **Descriptive names**: `getFileFormat()`, not `getType()`

## CSS Best Practices

### 1. Use CSS Variables
```css
/* Define in shared.css */
:root {
  --color-primary: #667eea;
  --space-md: 16px;
}

/* Use in component styles */
.button {
  background: var(--color-primary);
  padding: var(--space-md);
}
```

### 2. Organize Sections
```css
/* ======================== Card Styles ======================== */
.card { ... }

/* ======================== Button Styles ======================== */
.button { ... }
```

### 3. Avoid Duplication
- Extract common styles to shared CSS
- Use CSS variables instead of repeating colors
- Define animations once in shared.css

### 4. Responsive Design
```css
@media (max-width: 768px) {
  .container {
    padding: var(--space-sm);
  }
}
```

## Import Best Practices

### Absolute Imports (when configured)
```typescript
// With path aliases configured in tsconfig.json
import { Button } from '@components/ui/Button'
import { colors } from '@theme/colors'
```

### Relative Imports
```typescript
import { ConfigurationData } from '../types'
import { parseFile } from '../utils/fileParsers'
```

### Grouping Imports
```typescript
// 1. React and external libraries
import React, { useState } from 'react'
import axios from 'axios'

// 2. Internal imports from utils, constants, types
import { API_ENDPOINTS } from '../constants/api'
import { ConfigurationData } from '../types'

// 3. Components
import FileUploadMode from '../components/FileUploadMode'

// 4. Styles
import '../styles/ConfiguratorPage.css'
```

## Component Structure

### Functional Component Template
```typescript
import React, { useState } from 'react'
import { ConfigurationData } from '../types'
import { API_ENDPOINTS } from '../constants/api'
import '../styles/MyComponent.css'

interface MyComponentProps {
  data: ConfigurationData
  onUpdate: (data: ConfigurationData) => void
}

const MyComponent: React.FC<MyComponentProps> = ({ data, onUpdate }) => {
  const [state, setState] = useState<string>('')

  const handleChange = (newValue: string) => {
    setState(newValue)
  }

  return (
    <div className="my-component">
      {/* JSX */}
    </div>
  )
}

export default MyComponent
```

### Style Template
```css
/* ======================== Component Structure ======================== */
.my-component {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* ======================== Child Elements ======================== */
.my-component-header {
  font-size: 18px;
  color: var(--color-text-primary);
}

/* ======================== States ======================== */
.my-component.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* ======================== Responsive Design ======================== */
@media (max-width: 768px) {
  .my-component {
    gap: var(--space-sm);
  }
}
```

## Common Patterns

### Using Constants
```typescript
import { ACCEPTED_MIME_TYPES } from '../constants/files'

<input type="file" accept={ACCEPTED_MIME_TYPES} />
```

### Using Theme Colors
```typescript
import { PRIMARY, stringToColor } from '../theme/colors'

const containerColor = stringToColor(containerId)
return <div style={{ backgroundColor: containerColor }} />
```

### Parsing Files
```typescript
import { parseFile, isValidFileExtension } from '../utils/fileParsers'

if (!isValidFileExtension(file.name)) {
  setError('Invalid file type')
  return
}

try {
  const data = await parseFile(file)
  onUpload(data)
} catch (error) {
  setError(error.message)
}
```

### Error Handling
```typescript
// Error message markup (automatically styled from shared.css)
{error && <div className="error-message">{error}</div>}

// Success message
{success && <div className="success-message">{message}</div>}
```

## Future Improvements

### Phase 1: Design System Components
- [ ] Extract Button component
- [ ] Extract Input component
- [ ] Extract Select component
- [ ] Extract Card component
- [ ] Extract Modal component

### Phase 2: Reduce Component Complexity
- [ ] Extract NodeBadge from visualization components
- [ ] Create GraphContainer wrapper
- [ ] Move graph configuration to utilities
- [ ] Parametrize color mapping logic

### Phase 3: Monitoring and Testing
- [ ] Add unit tests for fileParsers.ts
- [ ] Add integration tests for components
- [ ] Add E2E tests for workflows
- [ ] Set up performance monitoring

### Phase 4: Migration to TypeScript Strict Mode
- [ ] Enable `strict: true` in tsconfig.json
- [ ] Fix all type errors
- [ ] Add stricter eslint rules

## Tips for Maintaining Clean Code

1. **Keep components small** - Extract sub-components when they exceed 200 lines
2. **One responsibility** - Each component should do one thing well
3. **No hardcoded values** - Use constants for all magic strings/numbers
4. **Consistent naming** - Follow the conventions defined above
5. **Document complex logic** - Add comments explaining "why" not "what"
6. **Test utilities** - Ensure utility functions are unit tested
7. **Use types** - Leverage TypeScript to catch errors early
8. **Review imports** - Keep imports organized and minimal

## Troubleshooting

### Issue: Colors don't match the design
**Solution**: Check `src/theme/colors.ts` for the correct color constant and update CSS variables if needed.

### Issue: File parsing fails for a specific format
**Solution**: Check `src/utils/fileParsers.ts` and `src/constants/files.ts` to ensure the format is supported.

### Issue: API calls fail
**Solution**: Verify endpoints in `src/constants/api.ts` and check environment variables.

### Issue: Styles not applying
**Solution**: Ensure CSS file is imported and class names match. Check for CSS specificity issues.

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS)
