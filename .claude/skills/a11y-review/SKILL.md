---
name: a11y-review
description: Review React components for WCAG 2.1 AA accessibility. Use when building or reviewing UI components, forms, or interactive elements.
---

## Accessibility Review — React + Radix/shadcn

Review the specified component(s) against WCAG 2.1 Level AA. Check each category below and report only actual issues found.

### Forms & Inputs
- Every input has a visible `<label>` or `aria-label`
- Form groups use `<fieldset>` + `<legend>`
- Error messages are linked via `aria-describedby`
- Required fields are indicated (not by color alone)

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order matches visual order
- No keyboard traps (can always Tab/Escape out)
- Custom widgets have appropriate key handlers (Space, Enter, Arrow keys)
- Visible focus indicators on all focusable elements

### Screen Readers
- Dynamic content updates use `aria-live` regions (`polite` for non-urgent, `assertive` for alerts)
- Conditional content that appears/disappears announces changes
- Decorative elements hidden with `aria-hidden="true"`
- Icons have `aria-label` or are hidden if decorative

### Semantic HTML
- Prefer native HTML elements over ARIA (`<button>` not `<div role="button">`)
- Headings follow hierarchy (no skipped levels)
- Lists use `<ul>`/`<ol>` + `<li>`
- Landmarks: `<main>`, `<nav>`, `<header>`, `<footer>`

### Visual
- Text contrast ratio: 4.5:1 minimum (3:1 for large text 18px+)
- Information not conveyed by color alone
- Content readable at 200% zoom
- Touch targets: 44x44px minimum

### Radix/shadcn Specifics
- Radix primitives (Checkbox, RadioGroup, Dialog) handle ARIA automatically — do not duplicate roles
- Check that `onCheckedChange`/`onValueChange` callbacks work, not just `onClick`
- Ensure shadcn `Form` components connect labels via `FormField` → `FormItem` → `FormLabel` → `FormControl`

### Output Format
For each issue found:
- **File:line** — Brief description of the problem
- **Fix** — Specific code change needed

If no issues: "No accessibility issues found."
