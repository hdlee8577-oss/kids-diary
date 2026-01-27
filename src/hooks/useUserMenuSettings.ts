"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { getAdminToken } from "@/lib/admin/clientToken";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

type UserMenuSettings = {
  enabledModules: string[];
  menuOrder: string[];
  roleMode: "parent" | "child" | "both";
  ageInMonths?: number;
  preset: string;
};

type UserMenuSettingsState = {
  settings: UserMenuSettings;
  loading: boolean;
  error: string | null;
  setSettings: (settings: UserMenuSettings) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const useUserMenuSettingsStore = create<UserMenuSettingsState>((set) => ({
  settings: {
    enabledModules: ["photos", "diary"], // 기본값
    menuOrder: [],
    roleMode: "parent",
    preset: "custom",
  },
  loading: true,
  error: null,
  setSettings: (settings) => set({ settings }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export function useUserMenuSettings() {
  const { settings, loading, error, setSettings, setLoading, setError } =
    useUserMenuSettingsStore();
  const { user } = useSupabaseUser();

  // 로그인 상태(user) 변경 시마다 설정을 다시 불러온다
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // 현재 로그인한 사용자 ID (없으면 undefined)
        const userId = user?.id;

        const adminToken = getAdminToken();
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        const res = await fetch(`/api/user/menu-settings${query}`, {
          headers: adminToken ? { "x-admin-token": adminToken } : {},
        });

        if (!res.ok) {
          throw new Error("Failed to fetch menu settings");
        }

        const data = (await res.json()) as { settings?: UserMenuSettings };
        if (!alive) return;

        if (data.settings) {
          setSettings({
            enabledModules: data.settings.enabledModules || [],
            menuOrder: data.settings.menuOrder || [],
            roleMode: data.settings.roleMode || "parent",
            ageInMonths: data.settings.ageInMonths,
            preset: data.settings.preset || "custom",
          });
        } else {
          // 기본값 설정
          setSettings({
            enabledModules: ["photos", "diary"],
            menuOrder: [],
            roleMode: "parent",
            preset: "custom",
          });
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        // 에러 시 기본값 설정
        setSettings({
          enabledModules: ["photos", "diary"],
          menuOrder: [],
          roleMode: "parent",
          preset: "custom",
        });
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id, setError, setLoading, setSettings]);

  async function updateSettings(updates: Partial<UserMenuSettings>) {
    const previous = settings;
    const newSettings = { ...settings, ...updates };

    // 전역 스토어를 먼저 업데이트 → 헤더 메뉴 등 즉시 반영
    setSettings(newSettings);
    setError(null);

    try {
      // 현재 로그인한 사용자 ID
      const userId = user?.id;

      const adminToken = getAdminToken();
      const res = await fetch(`/api/user/menu-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          userId,
          settings: newSettings,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to save menu settings");
      }
    } catch (err) {
      // 실패 시 이전 설정으로 복원
      setSettings(previous);
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }

  return {
    ...settings,
    loading,
    error,
    updateSettings,
  };
}

