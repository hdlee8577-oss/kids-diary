# Verification Guide

This document provides practical steps to verify that major features were created correctly.

## Confirm generated files

### 1) Menu modules

Check:

```bash
cat src/config/menuModules.ts
```

Expect:
- Multiple menu modules are defined (e.g., photos, diary, artworks).

### 2) Presets

```bash
cat src/config/menuPresets.ts
```

Expect:
- Multiple presets exist (e.g., baby/toddler/preschool/elementary/teen/custom).

### 3) DB schema SQL

```bash
cat docs/supabase-menu-settings.sql
```

Expect:
- `user_menu_settings` DDL exists and includes RLS guidance.

### 4) API route

```bash
cat src/app/api/user/menu-settings/route.ts
```

Expect:
- GET/POST endpoints.

### 5) Hook

```bash
cat src/hooks/useUserMenuSettings.ts
```

Expect:
- Fetch/save menu settings logic.

### 6) Dynamic navigation

```bash
cat src/components/layout/DynamicNav.tsx
```

Expect:
- Only enabled modules are rendered and ordering is respected.

### 7) Settings page

```bash
cat src/app/settings/menu/page.tsx
```

Expect:
- Preset selection + module checklist UI exists.

## Verify in the browser

### Step 1: start the dev server

```bash
npm run dev
```

### Step 2: open the app

- Visit `http://localhost:3000`

### Step 3: open menu settings

- Visit `http://localhost:3000/settings/menu`
- Confirm presets and checkboxes are rendered.

### Step 4: test saving

- Select a preset and save
- Return to home and confirm the header navigation updates.

## Note: DB migration required

Menu settings persistence requires the corresponding Supabase table.

Recommended:
- Use Supabase Dashboard → SQL Editor
- Run the SQL from `docs/supabase-menu-settings.sql`

## Git verification

### Recent commits

```bash
git log --oneline -5
```

### Changed files for a commit

```bash
git show <commit_sha> --name-only
```

