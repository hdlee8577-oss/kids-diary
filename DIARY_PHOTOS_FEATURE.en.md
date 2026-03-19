# Diary Photo Attachments

## Overview

The Diary module supports attaching up to **4 photos** per entry and renders them as a collage-style grid.

## Collage layouts

### 1 photo
- Aspect ratio: 16:9
- Layout: single wide tile

### 2 photos
- Aspect ratio: 1:1
- Layout: 2-column grid

### 3 photos
- Aspect ratio: 1:1
- Layout: 2 tiles on top + 1 tile spanning the full width at the bottom

### 4 photos
- Aspect ratio: 1:1
- Layout: 2x2 grid

## Database schema

```sql
ALTER TABLE public.diary_entries
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
```

## API changes

### GET `/api/diary`

```ts
type DiaryRow = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  photos: string[]; // added
  created_at: string;
};
```

### POST `/api/diary`

```ts
{
  title: string;
  content: string;
  entryDate: string;
  photos: string[]; // max 4
}
```

### PATCH `/api/diary/[id]`

```ts
{
  title?: string;
  content?: string;
  entryDate?: string;
  photos?: string[]; // max 4
}
```

## UI/UX behavior

### Diary create form
- Photo upload area:
  - Click-to-select files
  - Drag & drop (browser default)
  - Enforced max: 4
- Preview grid:
  - Shows previews immediately
  - Remove individual photos
  - Auto layout based on count

### Diary list cards
- Renders small thumbnails (up to 4).

### Diary detail page
- Renders a larger collage above the text body.

## Upload flow
1. User selects files
2. Upload to Storage via `POST /api/photos`
3. Collect returned public URLs
4. Persist URLs in `diary_entries.photos`

## Future improvements
- Reorder photos (drag & drop)
- Lightbox viewer on click
- Captions per photo
- Image compression for bandwidth/cost

