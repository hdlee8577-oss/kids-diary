# Development Time Estimates (Customization System + Modules)

This document provides rough estimates for implementing the customization system and modules.

## Phase 1: customization system

### 1.1 Menu module system (3–4 days)
Includes:
- `menuModules.ts`
- `menuPresets.ts`
- Types

Estimate: ~1 day

### 1.2 DB schema + API (2–3 days)
Includes:
- `user_menu_settings` table
- `/api/user/menu-settings` routes
- RLS setup

Estimate: ~1 day

### 1.3 Hooks and state (2–3 days)
Includes:
- `useUserMenuSettings`
- optional Zustand store
- fetch/save flows

Estimate: ~1 day

### 1.4 Dynamic navigation (2–3 days)
Includes:
- `DynamicNav`
- header integration
- enable/order logic

Estimate: ~1 day

### 1.5 Menu settings page (4–5 days)
Includes:
- preset selection UI
- module checklist grid
- grouping by category
- save flow

Estimate: ~2 days

### 1.6 Age-based recommendation (1–2 days)
Includes:
- age input
- preset recommendation logic

Estimate: ~0.5 day

Phase 1 total: ~6.5 days (~1 week)

## Phase 2: module pages

Status at time of writing:
- Photo Album: implemented
- Diary: implemented

New modules are estimated separately (growth/sleep/feeding/health, etc.).

