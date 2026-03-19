# UI Frame Structure Guide

This document describes the overall UI layout structure and page-level frames.

## Global layout

```
┌─────────────────────────────────────────────┐
│ Header (sticky, z-50)                       │
│  [Logo] [Nav] [Settings] [Hamburger]        │
├─────────────────────────────────────────────┤
│ Main content                                │
│  - centered container (max-w-5xl)           │
│  - px-4 (mobile) / px-6 (desktop)           │
└─────────────────────────────────────────────┘

Right sidebar (toggleable, z-60)
┌─────────────────────┐
│ Settings panel       │
│ - Profile            │
│ - Theme              │
└─────────────────────┘

Mobile menu (Portal, z-100)
┌─────────────────────┐
│ Slide-in drawer      │
│ - Navigation         │
│ - Settings           │
│ - Logout             │
└─────────────────────┘
```

## Page frames (examples)

### Home (`/`)
Key sections:
- Background blur/gradient visuals
- Hero copy + profile area
- Primary CTAs (Photo Album / Diary)
- Feature cards

### Photo Album (`/photos`)
Key sections:
- Header action bar (add/select/delete)
- Grid of photo cards (responsive)

### Diary (`/diary`)
Key sections:
- Header action bar (add/select/delete)
- Card list (responsive)
- Create form (optional)
  - Includes photo collage preview (up to 4)

### Artworks (`/artworks`)
Key sections:
- Header action bar (add/select/delete)
- Art cards with link/video affordances

### Timeline (`/timeline`)
Key sections:
- Filters (All / Photos / Diary)
- Mixed content cards

### Stats (`/stats`)
Key sections:
- Summary cards
- Monthly trends

