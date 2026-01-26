# kids-diary

Simple gallery + diary pages with Supabase storage.

## Features
- Gallery page with grid layout and modal preview
- Diary page with timeline layout by date
- Supabase Storage + Postgres for real persistence

## Files
- `index.html`: landing page
- `gallery.html`: photo gallery (grid + modal)
- `diary.html`: diary timeline
- `styles.css`: shared styling
- `app.js`: Supabase logic (uploads + entries)
- `config.js`: Supabase project config

## Supabase setup (beginner friendly)
1. Create a Supabase project: https://app.supabase.com
2. In the SQL Editor, run the SQL below to create tables + policies.
3. Create a public storage bucket named `photos`.
4. Copy your project URL + anon key into `config.js`.

### SQL: tables + policies
```sql
create extension if not exists "pgcrypto";

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  public_url text not null,
  original_name text,
  created_at timestamp with time zone default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table photos enable row level security;
alter table entries enable row level security;

create policy "public read photos" on photos
  for select using (true);

create policy "public insert photos" on photos
  for insert with check (true);

create policy "public read entries" on entries
  for select using (true);

create policy "public insert entries" on entries
  for insert with check (true);
```

### Storage bucket + policies
1. Go to **Storage** in Supabase.
2. Create a bucket named `photos`.
3. Set the bucket to **Public**.
4. In the SQL Editor, run:

```sql
create policy "public read photo objects" on storage.objects
  for select using (bucket_id = 'photos');

create policy "public insert photo objects" on storage.objects
  for insert with check (bucket_id = 'photos');
```

> Note: These policies allow anonymous read/write for a demo. For production,
> add auth and restrict policies.

## Configure `config.js`
Open `config.js` and replace placeholders:
```js
window.SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
window.SUPABASE_STORAGE_BUCKET = "photos";
```

## Run locally
Use any static server, for example:
```bash
python -m http.server 5173
```
Then open `http://localhost:5173` in your browser.