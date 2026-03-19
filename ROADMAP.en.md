# Pathfinder Kids — Development Roadmap

## Current state

### Implemented
- Photo upload and storage (Supabase Storage)
- Diary creation and management
- Profile settings (child name, bio, birthday)
- Theme customization (real-time)
- Thumbnail positioning
- Multi-file uploads
- Responsive design
- Menu customization (presets + dynamic navigation)
- Timeline view (`/timeline`) combining Photos + Diary
- Basic stats (`/stats`) for totals, last 30 days, monthly trend

### Missing relative to target model
- Grade classification (Pre-K → 12th)
- Category classification (STEM, Arts, Sports, Writing, etc.)
- OCR (handwriting → text)
- Growth timeline comparisons
- Portfolio PDF export
- Private sharing
- Parent note layer
- Search + filters
- AI summaries (emotion/development)
- Card-style share assets (Kakao/SNS)

## Phase 1: Core structure improvements (high priority)

### 1.1 DB schema expansion (proposal)

Current:
```sql
photos(id, site_id, title, image_url, taken_at, thumb_pos_x, thumb_pos_y, created_at)
diary_entries(id, site_id, title, content, entry_date, created_at)
```

Target (example):
```sql
photos(
  id, site_id, title, image_url, taken_at,
  grade,
  category,
  tags,
  mom_note,
  ocr_text,
  created_at
)

diary_entries(
  id, site_id, title, content, entry_date,
  grade,
  category,
  tags,
  mom_note,
  ocr_text,
  created_at
)
```

### 1.2 IA / routing improvements (proposal)

```
/ (dashboard: grade/category summaries)
/portfolio (portfolio views)
/upload (unified upload)
/share/[token] (private share)
```

## Phase 2: Differentiation features
- Grade/category classification UI and filters
- Parent note layer
- Search
- Portfolio views
- Export (PDF)

## Phase 3: AI features
- OCR indexing
- Auto-tagging
- Narrative and growth summaries
- Recommendations (next steps)

