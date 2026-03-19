# Mobile Menu Design Options

## Current issues
1. On mobile, the UI does not occupy the full width and feels unstable.
2. A floating button can feel non-standard for navigation.

## Solution options

### Option 1: Hamburger in the header (most common) — recommended
Pros:
- Standard web pattern
- Users are already familiar with it
- Natural integration with the header

Implementation:
- Hamburger button on the right side of the header
- Slide-in side menu (left or right)
- Place Settings inside the menu (e.g., near the bottom)

### Option 2: Bottom navigation bar (app style)
Pros:
- Familiar mobile-app pattern
- Primary navigation is always visible
- Easy to reach with a thumb

Implementation:
- Fixed bottom bar
- Icon + label items
- “More” for overflow items

### Option 3: Top dropdown menu
Pros:
- Simple and compact
- Efficient use of space

Implementation:
- Hamburger button in the header
- Dropdown expands downward
- Settings item included

### Option 4: Left side drawer (Material Design)
Pros:
- Material Design standard
- Large space for navigation + user info
- Supports settings/logout naturally

Implementation:
- Hamburger on the left
- Drawer slides from the left
- User profile and secondary actions included

## Fix: “not full width” behavior

Common causes:
- Missing `overflow-x` constraints
- `html/body` width limitations
- Fixed elements affecting layout

Recommended fixes:

1) Add to `src/app/globals.css`:

```css
html, body {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}
```

2) Ensure the body uses full width in `src/app/layout.tsx`:

```tsx
<body className="... w-full overflow-x-hidden">
```

3) Disable body scroll when the mobile menu is open:

```tsx
useEffect(() => {
  document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
}, [isMobileMenuOpen]);
```

## Recommendation
- Start with **Option 1** (header hamburger + slide-in drawer).
- Consider Option 2 only if you intentionally want an “app-like” navigation model.

