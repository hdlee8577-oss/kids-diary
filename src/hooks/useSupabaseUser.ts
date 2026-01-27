"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type UseSupabaseUserResult = {
  user: User | null;
  loading: boolean;
};

/**
 * 클라이언트에서 Supabase Auth의 현재 로그인된 유저를 가져오는 훅.
 * - 초기 렌더 시 한 번 user 정보를 불러오고
 * - 로그인/로그아웃이 발생하면 상태를 자동으로 갱신합니다.
 */
export function useSupabaseUser(): UseSupabaseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseBrowserClient) {
      setLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      // 개발 환경에서 자동 로그인 (테스트용)
      const isDev = process.env.NODE_ENV === "development";
      const testEmail = "hdlee8577@gmail.com";
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD || "test1234";

      // 현재 사용자 확인
      const { data: currentUserData } = await supabaseBrowserClient.auth.getUser();
      
      // 개발 환경이고 로그인되어 있지 않으면 자동 로그인 시도
      if (isDev && !currentUserData.user) {
        try {
          const { data: signInData, error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });
          
          if (!signInError && signInData.user) {
            if (!alive) return;
            setUser(signInData.user);
            setLoading(false);
            return;
          }
        } catch (err) {
          // 자동 로그인 실패 시 무시하고 계속 진행
          console.warn("[useSupabaseUser] 자동 로그인 실패:", err);
        }
      }

      if (!alive) return;
      setUser(currentUserData.user ?? null);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

