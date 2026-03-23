# Architecture

## System Overview

```mermaid
graph TD
  React["React + XState"] -->|HTTP API| Router["API Router"]
  Router -->|saveDraft| Store["JSON Store"]
  Router -->|submit| Rules["Permit Rules"]
  Rules -->|"answers + permitResult"| Store
```

On submit, the router passes answers + project location to `determinePermitRequirement()`, which returns one of three outcomes evaluated in priority order:

| Outcome | Triggered by |
| --- | --- |
| `in_house_review` | ADU, new bathroom/laundry, SF deck/garage, "other" |
| `otc_review` | Bathroom remodel, electrical, roof, garage + exterior doors |
| `no_permit` | Everything else (flooring, fencing, single door) |

## Form Update Flow

```mermaid
sequenceDiagram
  actor User
  participant Frontend as React + XState
  participant Backend as Hono Server

  User->>Frontend: Answers question
  Note over Frontend: 1s debounce
  Frontend->>Backend: saveDraft(answers, currentIndex)
  Backend->>Backend: Save with status: "draft"

  User->>Frontend: Clicks Submit
  Frontend->>Backend: submit(answers)
  Backend->>Backend: determinePermitRequirement()
  Backend-->>Frontend: permitResult
  Frontend->>Frontend: Show result

  Note over Frontend,Backend: On page reload
  Frontend->>Backend: getByProject()
  Backend-->>Frontend: draft or submitted record
  Frontend->>Frontend: Restore where user left off
```

## Key Decisions

- **XState v5 for form state** -- 6 states (idle, answering, submitting, submitted, reopening, deleting) with guards and timeouts. Makes impossible states unrepresentable.
- **Debounced auto-save** -- Saves drafts 1s after last change. Trailing debounce is suppressed after submission to prevent overwriting.
- **Backend-authoritative permit logic** -- Single source of truth; can't be spoofed by client.
- **Single record per project** -- `status: "draft" | "submitted"` on one record, overwritten in place. No orphan cleanup needed.
