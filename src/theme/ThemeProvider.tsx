"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { siteConfig, type SiteSettings } from "@/Site.config";
import { applyThemeToDom } from "@/theme/applyThemeToDom";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { getAdminToken } from "@/lib/admin/clientToken";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

type Props = {
  initialSettings?: SiteSettings | null;
  children: React.ReactNode;
};

async function fetchSettings(userId: string | null): Promise<SiteSettings | null> {
  const key = userId ?? siteConfig.siteId;
  const res = await fetch(`/api/site-settings?userId=${encodeURIComponent(key)}`, {
    method: "GET",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { settings?: SiteSettings | null };
  return data.settings ?? null;
}

async function saveSettings(settings: SiteSettings, userId: string | null): Promise<boolean> {
  try {
    const adminToken = getAdminToken();
    const res = await fetch(`/api/site-settings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(adminToken ? { "x-admin-token": adminToken } : {}),
      },
      body: JSON.stringify({
        userId,
        settings,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("설정 저장 실패:", data.error || res.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error("설정 저장 중 오류:", err);
    return false;
  }
}

export function ThemeProvider({ initialSettings, children }: Props) {
  const profile = useSiteSettingsStore((s) => s.profile);
  const theme = useSiteSettingsStore((s) => s.theme);
  const isHydrated = useSiteSettingsStore((s) => s.isHydrated);
  const hydrateFromRemote = useSiteSettingsStore((s) => s.hydrateFromRemote);
  const { user } = useSupabaseUser();
  const userId = user?.id ?? null;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
  const lastUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      // userId가 바뀌지 않았고 이미 하이드레이션 되어 있으면 아무것도 하지 않음
      if (isHydrated && lastUserIdRef.current === (userId ?? null)) return;
      lastUserIdRef.current = userId ?? null;

      // 1) 비로그인(게스트) 상태: 항상 코드 기본값(우리아이 등)을 사용
      //    DB나 기존 site_settings 테이블 값은 무시
      if (!userId) {
        hydrateFromRemote(null);
        return;
      }

      // 2) 로그인 상태: 해당 userId 기준으로 Supabase에서 설정 조회
      const remote = await fetchSettings(userId);
      if (!alive) return;
      hydrateFromRemote(remote);
    })();
    return () => {
      alive = false;
    };
  }, [hydrateFromRemote, isHydrated, userId]);

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
      const success = await saveSettings({ profile, theme }, userId);
      if (success) {
        lastSaved.current = serialized;
        setSaveError(null);
      } else {
        setSaveError("설정 저장에 실패했습니다. 브라우저 콘솔을 확인하세요.");
      }
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

