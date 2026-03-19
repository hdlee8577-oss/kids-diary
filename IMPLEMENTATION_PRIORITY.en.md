# Implementation Priority Guide

## Phase 1 (completed): customization system
- Menu module definitions (`menuModules.ts`)
- Presets (`menuPresets.ts`)
- DB schema for user menu settings
- API routes (`/api/user/menu-settings`)
- Hook (`useUserMenuSettings`)
- Dynamic navigation (`DynamicNav`)
- Menu settings page (`/settings/menu`)

## Next steps: recommended order

### Step 1: modules that reuse existing data (fast wins)

#### Timeline (approx. 3 days)
Why first:
- Uses existing Photo and Diary data
- No DB changes required

Scope:
- Combined chronological view
- Date grouping
- Type filtering (Photos / Diary)

#### Stats (approx. 4 days)
Why:
- Uses existing data
- Adds strong perceived value quickly

Scope:
- Totals, trends, and monthly charts

### Step 2: modules similar to Photo Album (reuse UI and API patterns)

#### Artworks (approx. 4 days)
Scope:
- Table schema + CRUD routes + list/detail pages

#### Awards/Certificates (approx. 3 days)
Scope:
- Similar to Artworks

### Step 3: record-style modules (new patterns)

Examples:
- Growth records
- Sleep records
- Feeding records
- Health records

