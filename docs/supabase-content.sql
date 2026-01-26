-- Supabase: photos / diary_entries 테이블 + Storage 버킷 가이드
-- 실행 위치: Supabase SQL Editor

-- (선택) uuid 생성 확장
create extension if not exists "pgcrypto";

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  title text not null default '',
  image_path text not null,
  image_url text not null,
  taken_at date null,
  created_at timestamptz not null default now()
);

create index if not exists photos_site_id_created_at_idx
  on public.photos (site_id, created_at desc);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  title text not null default '',
  content text not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists diary_entries_site_id_entry_date_idx
  on public.diary_entries (site_id, entry_date desc);

-- Storage
-- 1) Supabase Dashboard → Storage → New bucket: "photos"
-- 2) 버킷은 Public로 두면 image_url을 그대로 렌더링 가능
--    (Private로 두고 싶으면 signed URL 발급 방식으로 바꿔야 함)

