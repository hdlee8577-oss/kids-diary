# kids-diary

Simple, static web pages for a photo gallery and diary timeline. Data is stored
in Supabase (storage + database).

## Pages
- Gallery (index.html): Upload images, see them in a grid, open a modal preview.
- Diary (diary.html): Add short entries by date and view a timeline.

## Supabase setup
1. Create a Supabase project.
2. Create a storage bucket named `photos` and mark it as **public**.
3. Run the SQL below in the Supabase SQL editor.
4. Update `config.js` with your project URL and anon key.

### SQL for tables and policies
```sql
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  storage_path text not null,
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

create policy "public read photo objects" on storage.objects
  for select using (bucket_id = 'photos');

create policy "public upload photo objects" on storage.objects
  for insert with check (bucket_id = 'photos');
```

## Run locally
Use any static server so the module scripts load correctly.

```bash
python -m http.server 5173
```

Then open http://localhost:5173 in your browser.

## Notes
- The Supabase anon key is safe for client-side use, but the policies above are
  public. For production, restrict writes or add authentication.