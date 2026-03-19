# Customizable Menu System Design

## Core idea: modular navigation + per-user configuration

This system lets each user/family enable and order navigation modules based on their needs.

## Scenario-based menu configurations

### Scenario 1: Young child (0–3)
Suggested modules:
- Photo Album (simple)
- Parenting diary
- Growth tracking (height/weight)
- Sleep tracking (optional)

Not needed:
- Portfolio
- Artworks management
- Grade-based classification

### Scenario 2: Preschool / early elementary (4–8)
Suggested modules:
- Photo Album
- Diary
- Artworks (drawings, crafts)
- Awards/certificates
- Reading log (optional)

Optional:
- Grade-based classification

### Scenario 3: Older students (9+)
Suggested modules:
- Photo Album
- Diary
- Artworks
- Awards/certificates
- Reading log
- Portfolio (applications)
- Grade-based classification
- Activity tracking (STEM / Arts / Sports)

### Scenario 4: Parent-focused vs child-focused
Parent-focused examples:
- Photo Album
- Parenting diary
- Sleep/feeding/health logs
- Growth charts

Child-focused examples:
- My artworks
- My diary
- My awards
- My reading log
- My activities

## System architecture (high level)

1) Module definition
- Defined in `src/config/menuModules.ts`
- Each module has: id, label, icon, path, description, category

2) Presets
- Defined in `src/config/menuPresets.ts`
- Presets map to a curated set of enabled modules

3) User menu settings persistence
- Stored in Supabase table `user_menu_settings`
- Fields include enabled module IDs and ordering

4) UI rendering
- `src/components/layout/DynamicNav.tsx` renders enabled modules only
- Order follows stored user preferences

## Notes
- This is a private customization layer (not public social sharing).
- Pair this system with the Theme engine to keep UX consistent.

