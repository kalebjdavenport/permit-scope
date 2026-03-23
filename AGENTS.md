# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Commands

```bash
# Start the full dev server (backend + frontend via Turbo)
bun run dev

# Install dependencies (from repo root)
bun install
```

No test runner or lint scripts are configured. ESLint runs via VSCode auto-fix on save.

## Architecture

This is a **Bun + Turbo monorepo** with two workspaces: `backend/` and `frontend/`.

### Backend (`backend/`)

- **Hono** HTTP server on port 3333
- **Awilix** dependency injection: stores are registered in `core/container.ts` and accessed via `ctx.cradle` in API procedures
- **Store pattern**: `core/Store.ts` provides a generic CRUD base class with JSON file persistence (writes to `tmp/`). Extend it and register in the container (see `app/stores/ProjectStore.ts`)
- **Routers** live in `app/router/`, composed into `appRouter` in `app/router/index.ts`
- **Schemas** (Zod) go in `app/schemas/`
- Path aliases: `#app/*` → `./app/*`, `#core/*` → `./core/*`
- The `AppRouter` type is exported from `@permit-scope/backend` for frontend consumption

### Frontend (`frontend/`)

- **React 19** + **Vite** on port 6173 + **React Router 7** + **Tailwind CSS 4**
- **API client** configured in `src/lib/trpc.ts` — use the exported `trpc` proxy for type-safe queries/mutations with TanStack React Query
- **shadcn/ui** components in `src/components/ui/` (Button, Input, Card, Checkbox, RadioGroup, Form, Alert, Label, Breadcrumb)
- **React Hook Form** with `@hookform/resolvers` for form handling + Zod validation
- Pages go in `app/`, shared UI components in `src/components/ui/`
- Path aliases: `@/*` → `./src/*`, `@/app/*` → `./app/*`
- Routes defined in `app/App.tsx`: `/projects`, `/projects/new`, `/projects/:id`

### End-to-End Type Safety

Backend router type (`AppRouter`) is imported by the frontend via the `@permit-scope/backend` package. Changes to backend procedures automatically flow to frontend type checking.

## Code Style

- No semicolons, double quotes, no trailing commas, 2-space indent, 100 char print width (Prettier config in root `package.json`)
- Place backend code in `backend/app/`, frontend code in `frontend/app/`
- Do not modify scaffold configuration in `core/` directories
