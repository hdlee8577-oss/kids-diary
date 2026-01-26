# kids-diary

Simple gallery + diary app using Supabase for storage.

## Features
- Photo gallery grid with modal preview
- Diary timeline with date-based entries
- Supabase Storage + Postgres tables for persistence

## Supabase setup
1. Create a new Supabase project.
2. In SQL Editor, run the table setup:

```sql
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  url text not null,
  caption text,
  storage_path text not null
);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  entry_date date not null,
  content text not null
);
```

3. Enable Row Level Security and add policies:

```sql
alter table photos enable row level security;
alter table diary_entries enable row level security;

create policy "Public read photos"
  on photos for select
  using (true);

create policy "Public insert photos"
  on photos for insert
  with check (true);

create policy "Public read diary"
  on diary_entries for select
  using (true);

create policy "Public insert diary"
  on diary_entries for insert
  with check (true);
```

4. Create a Storage bucket named `photos` and set it to Public.
5. Add storage policies (SQL Editor):

```sql
create policy "Public read photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Public insert photos bucket"
  on storage.objects for insert
  with check (bucket_id = 'photos');
```

6. Copy config and add your keys:

```bash
cp config.example.js config.js
```

Edit `config.js` and set:
```
window.APP_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

## Run locally
Open `index.html` in a browser or use a simple static server.

## Notes
This starter uses the Supabase client directly in the browser. If you want
authentication or restricted access, add Supabase Auth and tighten policies.