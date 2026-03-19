# Pathfinder Kids — Business Model Summary & Improvement Plan

## Current product vs. target model

### Current state (implemented)
- Photo/Diary storage and browsing
- Theme customization
- Supabase persistence

### Target state
- “College-ready” achievement portfolio system
- Structured organization by grade and category
- Long-term storytelling tools

## Priority feature roadmap (business-driven)

### Priority 1: Structured classification
Why it matters:
- College applications value consistent, longitudinal evidence of activities.

Add:
- Grade selection (Pre-K → 12th)
- Category classification (STEM, Arts, Sports, Writing, etc.)
- Tags + filtering UI

Business value:
- Enables views like “STEM activities from 3rd to 10th grade”
- Makes portfolio generation feasible and scalable

### Priority 2: “Parent note”
Why it matters:
- Preserves context and narrative (what was learned, what was difficult, why it mattered).

Add:
- Parent comments on entries
- Story prompts/templates

Business value:
- Strengthens emotional retention
- Creates high-quality “growth story” content for portfolios

### Priority 3: Search
Add:
- Search across title, tags, parent notes
- OCR-powered search later

### Priority 4: Comparative growth timelines
Add:
- Compare the same topic over time (e.g., self-portraits from 1st → 5th grade)

### Priority 5: PDF portfolio export
Add:
- Curated selections → PDF
- Customizable layouts

Monetization:
- Freemium base; export features as paid tier

### Priority 6: AI OCR (handwriting)
Add:
- Optional OCR for uploaded images
- Index recognized text for search

### Priority 7: Private sharing
Add:
- Share links for specific portfolios/albums
- Optional expiry and password

## Information architecture (suggested)

Current:
```
/photos
/diary
```

Proposed:
```
/ (dashboard: grade/category summary)
/portfolio (portfolio views)
/upload (unified upload with grade/category/tags)
/share/[token] (private share)
```

## Monetization connection

Freemium example:
- Free: basic storage and classification
- Paid ($9.99/mo): larger storage, PDF export, advanced filtering, OCR

Long-term B2B:
- Sell as a student portfolio management tool for academies/schools

