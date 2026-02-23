---
name: frontend-quality
description: Review React components for code quality, clean patterns, and maintainability. Use when building or reviewing frontend code.
---

## Frontend Code Quality Review — React + TypeScript + Tailwind

Review the specified component(s) for quality. Check each category and report only actual issues.

### File Structure
- Each file does one thing (one component per file, one hook per file)
- Files stay under ~80-100 lines; split if larger
- Colocate related files (component + hook + types in same directory)
- No barrel exports that re-export everything

### Component Patterns
- Props are typed inline or with a named type (not `any`)
- Avoid prop drilling more than 2 levels — use context or composition
- Prefer composition (`children`) over configuration (long prop lists)
- No unnecessary `useEffect` — derive state from props/other state where possible
- No `useEffect` for event handling; use event handlers directly
- Early returns for loading/error/empty states before main render

### State Management
- State lives as close to where it's used as possible
- Derived values are computed inline, not stored in state
- No redundant state (state that can be computed from other state)
- Complex state logic belongs in a reducer or state machine, not scattered `useState`

### TypeScript
- No `any` types; use `unknown` if truly unknown, then narrow
- Infer types from usage where possible (don't over-annotate)
- Shared types live in a `types.ts` or alongside the thing they describe

### Tailwind
- Use semantic class ordering: layout → sizing → spacing → typography → visual → state
- Extract repeated class combinations to a component, not a utility string
- Use `cn()` for conditional classes (already available via `@/lib/utils`)

### Performance (only flag if actually relevant)
- Lists render with stable `key` props (not array index for dynamic lists)
- Expensive computations wrapped in `useMemo` only if measurably slow
- Event handlers stable where passed as props to memoized children

### Output Format
For each issue found:
- **File:line** — Brief description
- **Fix** — Specific change needed

If no issues: "No quality issues found."
