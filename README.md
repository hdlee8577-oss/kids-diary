# kids-diary

Simple static web app with:
- Photo gallery grid with lightbox preview
- Diary timeline page for short notes by date
- Supabase persistence for photos and notes

## Files
- index.html
- gallery.html
- diary.html
- styles.css
- gallery.js
- diary.js
- supabase-config.js
- supabase-client.js

## Run locally
1. Update `supabase-config.js` with your Supabase URL and anon key.
2. Start a local server:
   ```
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser.

## Supabase setup (beginner friendly)
This project uses Supabase. If you prefer Firebase, let me know and I can
provide an equivalent setup guide.

### 1) Create a Supabase project
- Go to https://supabase.com and create a new project.
- In Project Settings -> API, copy:
  - Project URL
  - anon public key

### 2) Create the storage bucket
- Go to Storage and create a new bucket named `photos`.
- Mark the bucket as Public (so images are readable without auth).

### 3) Create the tables
Open SQL Editor and run:
```sql
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null,
  created_at timestamptz not null default now()
);
```

### 4) Enable RLS and add policies
The demo uses public read + insert policies (no auth). For production,
lock this down and add authentication.

```sql
alter table photos enable row level security;
alter table diary_entries enable row level security;

create policy "public read photos" on photos
  for select using (true);
create policy "public insert photos" on photos
  for insert with check (true);

create policy "public read diary" on diary_entries
  for select using (true);
create policy "public insert diary" on diary_entries
  for insert with check (true);

create policy "public read photo objects" on storage.objects
  for select using (bucket_id = 'photos');
create policy "public insert photo objects" on storage.objects
  for insert with check (bucket_id = 'photos');
```

### 5) Update supabase-config.js
Replace the placeholder values:
```js
window.SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

You can now upload photos on `gallery.html` and save diary entries on
`diary.html`. Both pages read directly from Supabase.