# Work Request Guide: Developing with AI Assistance

This document describes how to request work effectively when collaborating with an AI coding agent.

## Effective request patterns

### Good examples

#### Example 1: Clear and specific

```
Create the menu module definition file for the customization system.
Define all menu modules in menuModules.ts.
Each module must include id, label, icon, path, description, and category.
```

#### Example 2: Step-by-step

```
Step 1: Create the DB schema
- Create user_menu_settings table SQL
- Include RLS policies
- Save to docs/supabase-menu-settings.sql
```

#### Example 3: Reference an existing file

```
Based on IMPLEMENTATION_GUIDE.md,
add grade, category, and tags fields to the upload form.
```

### Bad examples

#### Example 1: Too vague

```
Build the menu system.
```

#### Example 2: Too much at once

```
Build the customization system + all modules + the payments system.
```

#### Example 3: Missing context

```
Fix this.
```

## Request templates

### Template: New feature

```
Add the [feature name] feature.

Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]

Reference files:
- [relevant docs/files]

Priority:
- High / Medium / Low
```

### Template: Bug fix

```
Fix the [bug description].

Problem:
- [what is wrong]

Steps to reproduce:
- [how to reproduce]

Expected result:
- [what should happen]
```

