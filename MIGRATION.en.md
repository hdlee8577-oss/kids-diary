# Migration Guide

This document explains how to apply database schema changes required by the app.

## Diary photo attachments (2026-01-27)

The Diary module supports attaching up to 4 photos per entry (collage layout). This requires a new `photos` column in `public.diary_entries`.

### Option 1: Supabase Dashboard (recommended)

1. Open Supabase Dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run:

```sql
ALTER TABLE public.diary_entries
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.diary_entries.photos IS 'Array of photo URLs (max 4) for collage display';
```

### Option 2: Supabase CLI

```bash
npx supabase db push
```

Migration file: `supabase/migrations/20250127_add_diary_photos.sql`

### Verify

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'diary_entries'
  AND column_name = 'photos';
```

---

## Photo thumbnail position (thumb_pos_x / thumb_pos_y)

To enable thumbnail positioning for the Photo Album module, add columns to `public.photos`.

### Option 1: Supabase Dashboard (recommended)

```sql
ALTER TABLE IF EXISTS public.photos
  ADD COLUMN IF NOT EXISTS thumb_pos_x numeric(5, 2) NULL DEFAULT 50.0,
  ADD COLUMN IF NOT EXISTS thumb_pos_y numeric(5, 2) NULL DEFAULT 50.0;
```

### Option 2: Migration file

File: `supabase/migrations/20250126_add_thumb_pos.sql`

If Supabase CLI is installed:

```bash
supabase db push
```

### Verify

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'photos'
  AND column_name IN ('thumb_pos_x', 'thumb_pos_y');
```

## Notes
- All migrations are designed to be safe (`IF NOT EXISTS`).
- Consider backing up before applying schema changes.

