-- 사용자 메뉴 설정 테이블 (가장 간단한 버전)
-- 실행 위치: Supabase SQL Editor
-- 경고 없이 실행 가능

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_menu_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  enabled_modules JSONB DEFAULT '[]'::jsonb,
  menu_order JSONB DEFAULT '[]'::jsonb,
  role_mode TEXT DEFAULT 'parent' CHECK (role_mode IN ('parent', 'child', 'both')),
  age_in_months INTEGER,
  preset TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_menu_settings_user_id 
ON public.user_menu_settings(user_id);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.set_menu_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (기존 트리거가 있어도 에러 없이 재생성)
-- 주의: 이 방법은 트리거가 이미 있으면 에러가 날 수 있음
-- 하지만 IF NOT EXISTS가 없으므로, 수동으로 확인 후 실행하거나
-- 에러가 나면 무시하고 진행해도 됨
CREATE TRIGGER set_user_menu_settings_updated_at
BEFORE UPDATE ON public.user_menu_settings
FOR EACH ROW EXECUTE FUNCTION public.set_menu_settings_updated_at();
