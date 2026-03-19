# kids-diary

An extensible child growth tracking framework that can be customized per family.

## Getting started

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Pages
- `/` Home
- `/photos` Photo Album
- `/diary` Diary
- `/artworks` Artworks
- `/timeline` Timeline
- `/stats` Stats
- `/settings/menu` Menu settings

## Settings (Theme/Profile) + Supabase persistence

This project supports real-time preview for profile and theme settings from the Settings Sidebar and persists them to Supabase (`site_settings`).

- **Environment variables**: create `.env.local` (see `.env.local.example` if present)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `ADMIN_TOKEN` (optional: protects write endpoints)
- **SQL (site settings)**: `docs/supabase-site-settings.sql`
- **SQL (content)**: `docs/supabase-content.sql`

## Current DB schema (code-aligned)

Required tables in Supabase `public`:
- `site_settings(site_id, settings, updated_at)`
- `photos(id, site_id, title, image_path, image_url, taken_at, thumb_pos_x, thumb_pos_y, created_at)`
- `diary_entries(id, site_id, title, content, entry_date, photos, created_at)`
- `artworks(id, site_id, title, description, image_url, image_path, url, type, category, grade, tags, mom_note, artwork_date, created_at)`
- `user_menu_settings(user_id, enabled_modules, menu_order, updated_at)`
- Storage buckets: `photos`, `artworks`, `profile-photos`

## Migrations

See `MIGRATION.md` (Korean) or `MIGRATION.en.md` (English) for step-by-step migration instructions.

## Docs index (Korean ↔ English)

Glossary:
- `DOCS_GLOSSARY.en.md`

Core:
- `README.md` / `README.en.md`
- `PROJECT_STRUCTURE.md` / `PROJECT_STRUCTURE.en.md`
- `MIGRATION.md` / `MIGRATION.en.md`
- `HOW_TO_WORK.md` / `HOW_TO_WORK.en.md`
- `HOW_TO_TEST.md` / `HOW_TO_TEST.en.md`

Product / business:
- `PRODUCT_VISION_REPOSITIONING.md` / `PRODUCT_VISION_REPOSITIONING.en.md`
- `BUSINESS_MODEL_SUMMARY.md` / `BUSINESS_MODEL_SUMMARY.en.md`
- `MONETIZATION_GUIDE.md` / `MONETIZATION_GUIDE.en.md`
- `PROJECT_STATUS_ANALYSIS.md` / `PROJECT_STATUS_ANALYSIS.en.md`

Dev / UI:
- `CUSTOMIZATION_SYSTEM.md` / `CUSTOMIZATION_SYSTEM.en.md`
- `UI_FRAME_STRUCTURE.md` / `UI_FRAME_STRUCTURE.en.md`
- `ANIMATION_GUIDE.md` / `ANIMATION_GUIDE.en.md`
- `DESIGN_IMPROVEMENT_GUIDE.md` / `DESIGN_IMPROVEMENT_GUIDE.en.md`
- `DIARY_PHOTOS_FEATURE.md` / `DIARY_PHOTOS_FEATURE.en.md`
- `MOBILE_MENU_OPTIONS.md` / `MOBILE_MENU_OPTIONS.en.md`

Ops / roadmap:
- `ROADMAP.md` / `ROADMAP.en.md`
- `WORK_STATUS.md` / `WORK_STATUS.en.md`
- `IMPLEMENTATION_GUIDE.md` / `IMPLEMENTATION_GUIDE.en.md`
- `IMPLEMENTATION_PRIORITY.md` / `IMPLEMENTATION_PRIORITY.en.md`
- `TIMELINE_ESTIMATE.md` / `TIMELINE_ESTIMATE.en.md`
- `TIMELINE_IMPLEMENTATION.md` / `TIMELINE_IMPLEMENTATION.en.md`
- `WEB_VS_APP_ANALYSIS.md` / `WEB_VS_APP_ANALYSIS.en.md`
- `RECENT_UPDATES.md` / `RECENT_UPDATES.en.md`

