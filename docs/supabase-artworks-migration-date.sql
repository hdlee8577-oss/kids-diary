-- Supabase: artworks 테이블에 artwork_date 컬럼 추가
-- 실행 위치: Supabase SQL Editor

-- 작품을 만든 날짜 필드 추가
alter table if exists public.artworks
  add column if not exists artwork_date date null;

-- 인덱스 추가 (날짜별 정렬 성능 향상)
create index if not exists artworks_artwork_date_idx
  on public.artworks (artwork_date desc nulls last);
