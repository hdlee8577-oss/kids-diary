# Implementation Guide (Pathfinder Kids)

This guide outlines a practical sequence for implementing the next major features.

## 1) DB schema expansion (first)

Create a migration SQL file (example: `docs/supabase-migration-v2.sql`) to add classification and search-related fields:

```sql
-- photos table
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mom_note TEXT,
ADD COLUMN IF NOT EXISTS ocr_text TEXT;

-- diary_entries table
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS mom_note TEXT,
ADD COLUMN IF NOT EXISTS ocr_text TEXT;

-- indexes
CREATE INDEX IF NOT EXISTS idx_photos_grade ON photos(grade);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_diary_grade ON diary_entries(grade);
CREATE INDEX IF NOT EXISTS idx_diary_category ON diary_entries(category);
CREATE INDEX IF NOT EXISTS idx_diary_tags ON diary_entries USING GIN(tags);

-- share links
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('photo', 'diary', 'album')),
  item_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_site_id ON share_links(site_id);
```

## 2) Type definitions

Update `src/Site.config.ts` to add shared enums/types:
- Grade (Pre-K → 12th)
- Category (STEM/Art/Sports/Writing/Music/Other)

Extend `PhotoItem` and `DiaryItem` types to include:
- `grade`, `category`, `tags`, `mom_note`, `ocr_text`

## 3) Upload and edit forms

Add UI fields to upload forms (photos, diary, artworks) for:
- Grade
- Category
- Tags (with autocomplete later)
- Parent note

## 4) Filtering and search

Implement:
- Query params (`?grade=&category=&tag=`)
- Filter UI (header bar or sidebar)
- Search over title/tags/parent notes (OCR text later)

## 5) Portfolio views and export

Add:
- Portfolio pages (`/portfolio/...`)
- Selection and curation flows
- PDF export (paid feature candidate)

