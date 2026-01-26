-- Supabase: site_settings 테이블 (성장 기록 프레임워크 설정 저장)
-- 실행 위치: Supabase SQL Editor

create table if not exists public.site_settings (
  site_id text primary key,
  settings jsonb not null,
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

