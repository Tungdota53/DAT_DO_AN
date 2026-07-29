# FoodGo Admin Dashboard — Page Override

This page inherits `../MASTER.md`. The rules below override the master only for
the `/admin` workspace.

## Product Pattern

- **Pattern:** Real-time operations dashboard
- **Style:** Data-dense dashboard with calm, high-contrast surfaces
- **Density:** 8/10 — compact tables and filters, 8–32px spacing scale
- **Motion:** 4/10 — 150–300ms feedback, short panel transitions, no decorative loops
- **Primary task:** Let one administrator scan system health, then edit catalog
  and order data without leaving the workspace

## Layout

- Persistent dark sidebar on desktop; compact horizontal navigation on mobile
- KPI cards first, followed by the active management workspace
- Tables must remain scannable at 375px by converting rows into stacked cards
- Keep destructive actions visually separated and always require confirmation
- Show loading, empty, success, and recovery states inside the affected panel

## Visual Language

- Reuse FoodGo orange (`#EA580C`) for primary actions and selected navigation
- Use navy/slate surfaces for authority and operational focus
- Use green, amber, blue, and red status chips with text labels; never color alone
- Retain Outfit + Work Sans from the master system for brand consistency

## Accessibility & Interaction

- All controls at least 44px high
- Visible labels and focus rings for every form control
- Modal focus stays inside the dialog; Escape closes non-destructive dialogs
- Status updates use `aria-live="polite"`
- Respect `prefers-reduced-motion`
