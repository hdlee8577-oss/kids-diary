# Timeline Module — Implementation Proposal

## Overview

The Timeline page merges existing Photo and Diary data into a single chronological view.

Key characteristics:
- No new DB schema required (reuses existing tables)
- No new API required (reuses `/api/photos` and `/api/diary`)
- High UX value: users can review all records in one place

## Requirements

1) Data merge
- Merge photos + diary into unified items
- Sort by date descending (most recent first)
- Label each item type (photo/diary)

2) Grouping by date
- Group items by the same day
- Display a date header and item count

3) Filtering
- All
- Photos only
- Diary only

4) UX considerations
- Card layout
- Click-through to detail pages
- Loading/empty states
- Optional pagination/infinite scroll

## File structure

```
src/app/timeline/page.tsx
```

Reused endpoints:
- `src/app/api/photos/route.ts` (GET)
- `src/app/api/diary/route.ts` (GET)

Target links:
- `/photos/[id]`
- `/diary/[id]`

