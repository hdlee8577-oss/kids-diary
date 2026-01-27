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
      // 자동 로그인 설정 확인 (환경 변수로 제어)
      const autoLoginEnabled = process.env.NEXT_PUBLIC_AUTO_LOGIN_ENABLED === "true";
      const autoLoginEmail = process.env.NEXT_PUBLIC_AUTO_LOGIN_EMAIL || "hdlee8577@gmail.com";
      const autoLoginPassword = process.env.NEXT_PUBLIC_AUTO_LOGIN_PASSWORD || "";

      // 현재 사용자 확인
      const { data: currentUserData } = await supabaseBrowserClient.auth.getUser();
      
      // 이미 로그인되어 있으면 자동 로그인 시도하지 않음
      if (currentUserData.user) {
        if (!alive) return;
        setUser(currentUserData.user);
        setLoading(false);
        return;
      }

      // 자동 로그인이 활성화되어 있고, 비밀번호가 설정되어 있으며, 아직 자동 로그인을 시도하지 않았으면 자동 로그인 시도
      const AUTO_LOGIN_ATTEMPTED_KEY = "kids-diary:autoLoginAttempted";
      const hasAttemptedAutoLogin = typeof window !== "undefined" && localStorage.getItem(AUTO_LOGIN_ATTEMPTED_KEY) === "true";
      
      if (autoLoginEnabled && autoLoginPassword && !hasAttemptedAutoLogin) {
        try {
          // 자동 로그인 시도 플래그 설정
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTO_LOGIN_ATTEMPTED_KEY, "true");
          }

          const { data: signInData, error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
            email: autoLoginEmail,
            password: autoLoginPassword,
          });
          
          if (!signInError && signInData.user) {
            if (!alive) return;
            setUser(signInData.user);
            setLoading(false);
            return;
          } else if (signInError) {
            console.warn("[useSupabaseUser] 자동 로그인 실패:", signInError.message);
          }
        } catch (err) {
          // 자동 로그인 실패 시 무시하고 계속 진행
          console.warn("[useSupabaseUser] 자동 로그인 오류:", err);
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

