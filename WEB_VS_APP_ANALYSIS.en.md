# Web vs. App: Strategic Analysis

## Recommendation (summary)
Start with **web**, strengthen with **PWA**, and add a native app only if the product proves demand.

## Web (current direction)

Pros:
- Cross-platform (iOS/Android/Windows/Mac) with one codebase
- Fast deployment (no store review)
- Low entry barrier (no install)
- SEO and link-based sharing
- Lower cost and simpler maintenance

Cons:
- Limited native UX for some features (camera workflows, push notifications)
- No app store discovery
- Potential performance gap vs. native (often acceptable with Next.js)

## Native apps (iOS/Android)

Pros:
- Best native UX and performance
- App store discovery and trust signals
- Advanced features (push, offline sync, background uploads)

Cons:
- Higher cost (two platforms or complex cross-platform)
- Slower releases (store review)
- Platform policy risk and fees (often ~30%)
- Maintenance overhead

## Progressive Web App (PWA)

PWA combines web delivery with some “app-like” behaviors:
- Installable experience
- Offline caching (limited)
- Push notifications (limited/complex)

Implementation idea:
```bash
npm install next-pwa
```

## Phased strategy

### Phase 1: Web MVP (0–3 months)
- Complete core product
- Acquire early users
- Iterate quickly

### Phase 2: Add PWA (3–6 months)
- Manifest + service worker
- Offline caching
- “Add to home screen” prompts

### Phase 3: Native app (6+ months)
Only if:
- meaningful user base exists (e.g., 1,000+ active users)
- native-only features become critical

