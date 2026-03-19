# Project Structure Guide

This document describes the codebase layout, key modules, and major UI architecture.

## Directory layout (high level)

```
kids-diary/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── layout.tsx          # Root layout (header, sidebar)
│   │   ├── page.tsx            # Home (/)
│   │   ├── globals.css         # Global styles
│   │   ├── api/                # API routes
│   │   │   ├── photos/         # Photo CRUD
│   │   │   ├── diary/          # Diary CRUD
│   │   │   ├── artworks/       # Artworks CRUD
│   │   │   ├── site-settings/  # Site settings persistence
│   │   │   ├── profile-photo/  # Profile photo upload
│   │   │   └── user/menu-settings/ # Menu customization
│   │   ├── photos/             # Photo Album pages
│   │   ├── diary/              # Diary pages
│   │   ├── artworks/           # Artworks pages
│   │   ├── auth/               # Auth page
│   │   ├── settings/menu/      # Menu settings UI
│   │   ├── timeline/           # Timeline view
│   │   └── stats/              # Stats view
│   ├── components/             # React components
│   │   ├── layout/             # Layout components (header/nav)
│   │   ├── home/               # Home components
│   │   ├── settings/           # Settings components
│   │   └── shared/             # Shared UI components
│   ├── config/                 # Menu module definitions and presets
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Supabase + admin utilities
│   ├── stores/                 # Zustand stores
│   ├── theme/                  # Theme system (CSS variables)
│   └── Site.config.ts          # Default site configuration
└── docs/                       # SQL files and schema helpers
```

## UI frame (layout)

```
┌─────────────────────────────────────┐
│ SiteHeader (sticky header)          │
│ - Desktop: DynamicNav               │
│ - Mobile: hamburger menu (portal)   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ SettingsSidebar (right sidebar)     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Page content (children)             │
│ - centered max width                │
└─────────────────────────────────────┘
```

### Key components

#### `src/components/layout/SiteHeader.tsx`
- Sticky header, desktop navigation, and mobile hamburger menu.
- Mobile menu is rendered via a React Portal to avoid stacking-context issues.

#### `src/components/layout/DynamicNav.tsx`
- Builds navigation dynamically from user menu settings (module enablement/order).

#### `src/components/home/HomeHero.tsx`
- Home hero section, profile display/editing, and quick actions.
- Uses local date parsing to avoid timezone shifts for birthday display.

## Major features (overview)
- **Mobile UX**: portal-based hamburger menu and mobile-friendly list layouts.
- **Theme system**: CSS variable-driven theme updates applied in real time.
- **Diary photos**: attach up to 4 photos with collage-style grid layout.
- **Artworks**: supports image/video/link entries with external link affordances.

## Dependencies (not exhaustive)
- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS
- UI/animation: lucide-react, framer-motion
- Backend: Supabase (DB + Storage)

