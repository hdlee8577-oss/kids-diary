-- 사용자 메뉴 설정 테이블
-- 실행 위치: Supabase SQL Editor
-- 주의: 현재는 인증 시스템이 없으므로 user_id를 TEXT로 사용 (siteId)
-- 나중에 Supabase Auth 추가 시 UUID로 변경하고 REFERENCES auth.users(id) 추가

CREATE TABLE IF NOT EXISTS public.user_menu_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- 임시: siteId 사용, 나중에 UUID로 변경
  enabled_modules JSONB DEFAULT '[]'::jsonb, -- 활성화된 메뉴 ID 배열
  menu_order JSONB DEFAULT '[]'::jsonb,     -- 메뉴 순서
  role_mode TEXT DEFAULT 'parent' CHECK (role_mode IN ('parent', 'child', 'both')),
  age_in_months INTEGER,                    -- 아이 나이 (월)
  preset TEXT,                              -- 'baby', 'toddler', 'elementary', 'teen', 'custom'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_menu_settings_user_id 
ON public.user_menu_settings(user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_menu_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_menu_settings_updated_at ON public.user_menu_settings;
CREATE TRIGGER set_user_menu_settings_updated_at
BEFORE UPDATE ON public.user_menu_settings
FOR EACH ROW EXECUTE FUNCTION public.set_menu_settings_updated_at();

-- RLS (Row Level Security) 설정
-- 주의: 현재는 인증이 없으므로 RLS 비활성화
-- 나중에 Supabase Auth 추가 시 활성화하고 위의 정책 사용

-- ALTER TABLE public.user_menu_settings ENABLE ROW LEVEL SECURITY;

-- 나중에 인증 추가 시 사용할 정책들:
-- CREATE POLICY "Users can view own menu settings"
--   ON public.user_menu_settings FOR SELECT
--   USING (auth.uid()::text = user_id);
--
-- CREATE POLICY "Users can update own menu settings"
--   ON public.user_menu_settings FOR UPDATE
--   USING (auth.uid()::text = user_id);
--
-- CREATE POLICY "Users can insert own menu settings"
--   ON public.user_menu_settings FOR INSERT
--   WITH CHECK (auth.uid()::text = user_id);
--
-- CREATE POLICY "Users can delete own menu settings"
--   ON public.user_menu_settings FOR DELETE
--   USING (auth.uid()::text = user_id);
