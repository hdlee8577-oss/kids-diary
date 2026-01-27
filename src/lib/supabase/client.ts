"use client";

import { createClient } from "@supabase/supabase-js";

// 브라우저에서 사용하는 Supabase 클라이언트 (Auth 전용)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // 빌드 타임에 메시지로만 남기고, 런타임에서는 조용히 실패하게 둡니다.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase/client] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았어요. 로그인 기능이 동작하지 않습니다.",
  );
}

export const supabaseBrowserClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

