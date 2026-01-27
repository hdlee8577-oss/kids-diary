"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/Site.config";
import { getAdminToken } from "@/lib/admin/clientToken";

type UserMenuSettings = {
  enabledModules: string[];
  menuOrder: string[];
  roleMode: "parent" | "child" | "both";
  ageInMonths?: number;
  preset: string;
};

export function useUserMenuSettings() {
  const [settings, setSettings] = useState<UserMenuSettings>({
    enabledModules: ["photos", "diary"], // 기본값
    menuOrder: [],
    roleMode: "parent",
    preset: "custom",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          setSettings(data.settings);
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
  }, []);

  async function updateSettings(updates: Partial<UserMenuSettings>) {
    const newSettings = { ...settings, ...updates };
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
      setError(err instanceof Error ? err.message : "Unknown error");
      // 실패 시 이전 설정으로 복원
      setSettings(settings);
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
