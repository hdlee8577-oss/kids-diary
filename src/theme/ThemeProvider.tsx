"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { siteConfig, type SiteSettings } from "@/Site.config";
import { applyThemeToDom } from "@/theme/applyThemeToDom";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { getAdminToken } from "@/lib/admin/clientToken";

type Props = {
  initialSettings?: SiteSettings | null;
  children: React.ReactNode;
};

async function fetchSettings(): Promise<SiteSettings | null> {
  const res = await fetch(
    `/api/site-settings?siteId=${encodeURIComponent(siteConfig.siteId)}`,
    { method: "GET" },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { settings?: SiteSettings | null };
  return data.settings ?? null;
}

async function saveSettings(settings: SiteSettings) {
  const adminToken = getAdminToken();
  await fetch(`/api/site-settings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify({ siteId: siteConfig.siteId, settings }),
  });
}

export function ThemeProvider({ initialSettings, children }: Props) {
  const profile = useSiteSettingsStore((s) => s.profile);
  const theme = useSiteSettingsStore((s) => s.theme);
  const isHydrated = useSiteSettingsStore((s) => s.isHydrated);
  const hydrateFromRemote = useSiteSettingsStore((s) => s.hydrateFromRemote);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const ui = useMemo(
    () => ({
      isSettingsOpen,
      openSettings: () => setIsSettingsOpen(true),
      closeSettings: () => setIsSettingsOpen(false),
      toggleSettings: () => setIsSettingsOpen((v) => !v),
    }),
    [isSettingsOpen],
  );

  // 1) initial hydration (server-provided or remote)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (isHydrated) return;

      if (initialSettings) {
        hydrateFromRemote(initialSettings);
        return;
      }

      const remote = await fetchSettings();
      if (!alive) return;
      hydrateFromRemote(remote);
    })();
    return () => {
      alive = false;
    };
  }, [hydrateFromRemote, initialSettings, isHydrated]);

  // 2) apply theme to DOM immediately (realtime preview)
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  // 3) persist changes (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>("");
  useEffect(() => {
    if (!isHydrated) return;

    const serialized = JSON.stringify({ profile, theme });
    if (serialized === lastSaved.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveSettings({ profile, theme });
      lastSaved.current = serialized;
    }, 600);
  }, [isHydrated, profile, theme]);

  return (
    <ThemeUIContext.Provider value={ui}>{children}</ThemeUIContext.Provider>
  );
}

type ThemeUI = {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
};

const ThemeUIContext = createContext<ThemeUI | null>(null);

export function useThemeUI() {
  const v = useContext(ThemeUIContext);
  if (!v) throw new Error("useThemeUI must be used within ThemeProvider");
  return v;
}

