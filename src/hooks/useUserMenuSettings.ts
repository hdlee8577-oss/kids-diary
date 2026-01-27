"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { siteConfig } from "@/Site.config";
import { getAdminToken } from "@/lib/admin/clientToken";

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

let hasFetchedOnce = false;

export function useUserMenuSettings() {
  const { settings, loading, error, setSettings, setLoading, setError } =
    useUserMenuSettingsStore();

  // 최초 1회만 서버에서 설정을 불러와서 전역 스토어에 넣는다.
  useEffect(() => {
    if (hasFetchedOnce) return;
    hasFetchedOnce = true;

    let alive = true;
    (async () => {
      try {
        const adminToken = getAdminToken();
        const res = await fetch(
          `/api/user/menu-settings?siteId=${encodeURIComponent(siteConfig.siteId)}`,
          {
            headers: adminToken ? { "x-admin-token": adminToken } : {},
          }
        );

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
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [setError, setLoading, setSettings]);

  async function updateSettings(updates: Partial<UserMenuSettings>) {
    const previous = settings;
    const newSettings = { ...settings, ...updates };

    // 전역 스토어를 먼저 업데이트 → 헤더 메뉴 등 즉시 반영
    setSettings(newSettings);
    setError(null);

    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/user/menu-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          siteId: siteConfig.siteId,
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

