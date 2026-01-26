-- 썸네일 크롭(포커스) 위치 저장용 컬럼 추가
-- 실행: Supabase SQL Editor

alter table public.photos
  add column if not exists thumb_pos_x real not null default 50;

alter table public.photos
  add column if not exists thumb_pos_y real not null default 50;

