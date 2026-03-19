# Design Improvement Guide

## Completed work (2026-01-27)

### Option 2 (“Do it properly”) — completed

Installed packages:
- `lucide-react@0.563.0` (icon system)
- `framer-motion@12.29.2` (animation system)

Improved pages:
1. Home hero — icons + animation + theme unification
2. Header navigation — icons + staggered animation
3. Photo Album list — card animations + icons
4. Diary list — card animations + icons
5. Artworks list — card animations + icons
6. Timeline — filter icons + card icons
7. Photo detail — layout refinement + animation
8. Diary detail — layout refinement + animation
9. Artwork detail — layout refinement + animation
10. Stats — animated chart bars + icons

Theme system unification:
- Enhanced `applyThemeToDom` to generate derived color variants
- Removed hard-coded colors
- Standardized on CSS variables
- Verified real-time theme updates across the UI

## Prior design problems (resolved)
- Flat visuals → improved depth/shadows
- Monotonous colors → theme-driven palette + gradients
- No animation → consistent motion patterns
- Emoji icons → vector icon system
- Basic typography → partially improved

## Design improvement strategy (general)

### Level 1: Quick improvements (1–2 days)
- Add depth: shadows, borders, hover states
- Improve contrast and readability
- Introduce subtle gradients

### Level 2: Intermediate improvements (3–5 days)
- Adopt an icon system
- Introduce motion/interaction patterns
- Build reusable component styling primitives

### Level 3: Advanced improvements (1–2 weeks)
- Establish a formal design system
- Accessibility auditing and improvements
- UX research and iterative refinement

