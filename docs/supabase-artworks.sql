-- Supabase: artworks 테이블 생성
-- 실행 위치: Supabase SQL Editor

-- (선택) uuid 생성 확장
create extension if not exists "pgcrypto";

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  title text not null default '',
  description text,
  image_path text not null,
  image_url text not null,
  category text, -- 'Art', 'STEM', 'Writing', 'Music', 'Other'
  grade text, -- 'Pre-K', 'K', '1st', '2nd', ..., '12th'
  tags jsonb default '[]'::jsonb,
  mom_note text,
  created_at timestamptz not null default now()
);

create index if not exists artworks_site_id_created_at_idx
  on public.artworks (site_id, created_at desc);

create index if not exists artworks_category_idx
  on public.artworks (category);

create index if not exists artworks_grade_idx
  on public.artworks (grade);

-- Storage
-- 1) Supabase Dashboard → Storage → New bucket: "artworks"
-- 2) 버킷은 Public으로 설정하면 image_url을 그대로 렌더링 가능
