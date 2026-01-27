-- Supabase: artworks 테이블에 URL 및 타입 필드 추가
-- 실행 위치: Supabase SQL Editor

-- URL 필드 추가 (유튜브 등 외부 링크)
alter table if exists public.artworks
  add column if not exists url text null;

-- 작품 타입 필드 추가 ('image', 'video', 'writing', 'link')
alter table if exists public.artworks
  add column if not exists type text null default 'image';

-- image_path와 image_url을 nullable로 변경 (URL 타입일 때는 없을 수 있음)
-- 이미 nullable이면 에러가 나지 않음
alter table if exists public.artworks
  alter column image_path drop not null,
  alter column image_url drop not null;

-- 인덱스 추가
create index if not exists artworks_type_idx
  on public.artworks (type);

create index if not exists artworks_url_idx
  on public.artworks (url);
