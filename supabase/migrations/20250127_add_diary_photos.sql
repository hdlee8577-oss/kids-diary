-- Add photos field to diary_entries table
-- Allows up to 4 photo URLs per diary entry

ALTER TABLE public.diary_entries
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.diary_entries.photos IS 'Array of photo URLs (max 4) for collage display';
