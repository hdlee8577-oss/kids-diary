# Recent Updates

## 2026-01-27 (Phase 3): Diary photo attachments

- Added photo attachments for Diary entries (max 4).
- Implemented collage layouts based on photo count:
  - 1: 16:9 single tile
  - 2: 2-column square tiles
  - 3: 2 tiles + 1 spanning full width
  - 4: 2x2 grid
- Upload UI:
  - drag/drop area
  - remove button per photo
  - live preview
- Display locations:
  - create form preview
  - list card thumbnails
  - detail page collage
- DB:
  - `diary_entries.photos` (`TEXT[]`)
  - migration: `supabase/migrations/20250127_add_diary_photos.sql`

## 2026-01-27 (Phase 2): Design system overhaul

- Theme system unified around CSS variables (real-time updates).
- Added generated color variants in `applyThemeToDom`.
- Introduced icon system via `lucide-react`.
- Introduced animation system via `framer-motion`:
  - page load fade/slide
  - button hover/tap scale
  - card hover lift
  - chart bar animations
  - staggered menu animations
- Improved readability:
  - text shadows
  - stronger borders
  - stronger shadows

## 2026-01-27 (Phase 1): Mobile UX improvements

- Implemented mobile hamburger menu via React Portal (z-index 100).
- Improved list page layouts for mobile (stacked headers, tighter grids).
- Added interactive profile photo editing (drag + zoom).
- Fixed birthday formatting by avoiding timezone shifts (local date parsing).

