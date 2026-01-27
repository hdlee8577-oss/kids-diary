"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconButton } from "@/components/shared/IconButton";
import { useThemeUI } from "@/theme/ThemeProvider";
import { DynamicNav } from "./DynamicNav";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { siteConfig } from "@/Site.config";

function GearIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const { toggleSettings } = useThemeUI();
  const { user } = useSupabaseUser();
  const router = useRouter();
  const resetSettings = useSiteSettingsStore((s) => s.resetToDefault);
  const profile = useSiteSettingsStore((s) => s.profile);
  const theme = useSiteSettingsStore((s) => s.theme);

  async function handleLogout() {
    if (!supabaseBrowserClient) return;
    await supabaseBrowserClient.auth.signOut();
    // 프로필/테마를 게스트 기본값(우리아이 등)으로 되돌리기
    resetSettings();
    // 자동 로그인 플래그는 유지 (한 번 시도했으면 더 이상 자동 로그인하지 않음)
    router.refresh();
  }

  const childName = profile.childName || siteConfig.profile.childName;
  const mood = theme.homeMood || siteConfig.defaults.theme.homeMood || {
    accentColor1: "#FECDD3",
    accentColor2: "#FDE68A",
    character: "🌸",
    preset: "warm",
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-surface)]/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold tracking-tight shadow-sm transition-all hover:shadow-md"
          style={{
            background: `linear-gradient(135deg, ${mood.accentColor1}20, ${mood.accentColor2}20)`,
            borderColor: `${mood.accentColor1}50`,
            color: `var(--color-primary)`,
          }}
        >
          <span className="text-base leading-none">{mood.character || "🌸"}</span>
          <span className="font-bold" style={{ color: `var(--color-primary)` }}>
            {childName}의 성장기록
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <DynamicNav />
          {user ? (
            <div className="hidden items-center gap-2 text-xs sm:flex">
              <span className="max-w-[140px] truncate text-black/60">
                {user.email ?? "로그인됨"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-black/10 px-2 py-1 text-[11px] font-medium text-black/60 hover:border-black/20 hover:text-[var(--color-text)]"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden text-xs font-medium text-black/60 hover:text-[var(--color-text)] sm:inline-block"
            >
              로그인 / 회원가입
            </Link>
          )}
          <IconButton label="설정" onClick={toggleSettings}>
            <GearIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

