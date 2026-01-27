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
      const { data } = await supabaseBrowserClient.auth.getUser();
      if (!alive) return;
      setUser(data.user ?? null);
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

