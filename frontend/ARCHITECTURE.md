# Frontend Architecture

This frontend follows **Hexagonal Architecture** principles, ensuring clear separation of concerns and maintainability.

## Folder Structure

```
frontend/
├── src/
│   ├── core/                    # Core domain layer (no framework dependencies)
│   │   ├── domain/             # Domain models, types, interfaces
│   │   └── ports/               # Port interfaces (contracts for adapters)
│   │
│   ├── application/             # Application layer (can use React Query)
│   │   ├── services/           # Application services
│   │   └── hooks/              # React Query hooks, custom hooks
│   │
│   ├── adapters/                # Adapters layer (infrastructure)
│   │   ├── api/                # API clients (Axios, fetch wrappers)
│   │   └── external/           # External service adapters
│   │
│   ├── ui/                      # UI layer (React components only)
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── layouts/            # Layout components
│   │   └── styles/             # CSS, Tailwind styles
│   │
│   └── shared/                  # Shared utilities
│       ├── utils/              # Utility functions
│       ├── constants/          # Constants, enums
│       └── types/              # Shared TypeScript types
│
├── public/                      # Static assets
├── index.html                   # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Architecture Rules

### Core Layer (`core/`)
- **No React imports** - Pure TypeScript
- **No framework dependencies** - Framework-agnostic
- Contains domain models, types, and business logic
- Defines port interfaces (contracts)

### Application Layer (`application/`)
- **Can use React Query** - For data fetching
- **Can use React hooks** - Custom hooks
- Contains application services
- Orchestrates domain logic

### Adapters Layer (`adapters/`)
- **API clients** - HTTP requests, Axios wrappers
- **External services** - Third-party integrations
- Implements port interfaces from core
- Handles all external communication

### UI Layer (`ui/`)
- **Only place React is used** - All React components here
- **No business logic** - Only presentation
- Components, pages, layouts
- Uses hooks from application layer

### Shared (`shared/`)
- **Framework-agnostic utilities**
- Constants, enums, helper functions
- Shared TypeScript types

## Dependency Flow

```
UI Layer
  ↓ uses
Application Layer (hooks, services)
  ↓ uses
Core Layer (domain, ports)
  ↑ implemented by
Adapters Layer (api, external)
```

## Example Import Pattern

```typescript
// ✅ Good - UI component using application hook
// ui/components/RouteList.tsx
import { useRoutes } from '@/application/hooks/useRoutes';

// ✅ Good - Application hook using adapter
// application/hooks/useRoutes.ts
import { routeApi } from '@/adapters/api/routeApi';

// ✅ Good - Adapter implementing port
// adapters/api/routeApi.ts
import { RouteRepository } from '@/core/ports/RouteRepository';

// ❌ Bad - Core importing React
// core/domain/Route.ts
import { useState } from 'react'; // NO!
```

## Technology Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework (only in ui/ layer)
- **TypeScript** - Type safety (strict mode)
- **Tailwind CSS** - Utility-first CSS
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zod** - Schema validation

