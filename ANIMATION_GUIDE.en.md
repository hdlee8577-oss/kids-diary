# Animation Guide

## Animation system used in this project

### Library
- `framer-motion@12.29.2`

## Animation patterns

### 1) Page load animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Page content */}
</motion.div>
```

Effect:
- The page fades in while moving upward.

### 2) Staggered animation

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    {item.content}
  </motion.div>
))}
```

Effect:
- Items appear sequentially (menus, card lists).

### 3) Button interactions

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click
</motion.button>
```

Effect:
- Hover: scale up 5%
- Tap: scale down 5%

### 4) Card hover

```tsx
<motion.article
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ y: -4, transition: { duration: 0.2 } }}
>
  {/* Card content */}
</motion.article>
```

Effect:
- Load: fade in + slight scale
- Hover: lift by 4px

### 5) Back button direction cue

```tsx
<motion.div whileHover={{ x: -4 }}>
  <ArrowLeft className="w-4 h-4" />
  Back
</motion.div>
```

Effect:
- Moves left on hover to reinforce direction.

### 6) Progress bar animation

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  style={{ background: "var(--color-primary)" }}
/>
```

Effect:
- Fills from left to right.

### 7) Dropdown animation

```tsx
{isOpen && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
  >
    {/* Menu */}
  </motion.div>
)}
```

Effect:
- Smooth enter/exit for dropdown menus.

