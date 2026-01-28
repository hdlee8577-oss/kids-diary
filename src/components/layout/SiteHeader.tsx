"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { IconButton } from "@/components/shared/IconButton";
import { useThemeUI } from "@/theme/ThemeProvider";
import { DynamicNav } from "./DynamicNav";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";
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
  const pathname = usePathname();
  const resetSettings = useSiteSettingsStore((s) => s.resetToDefault);
  const profile = useSiteSettingsStore((s) => s.profile);
  const theme = useSiteSettingsStore((s) => s.theme);
  const { enabledModules, menuOrder, loading, error } = useUserMenuSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 모바일 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    if (!supabaseBrowserClient) return;
    await supabaseBrowserClient.auth.signOut();
    resetSettings();
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  // 모바일 메뉴 데이터 준비
  const getMobileMenuData = () => {
    // 기본 메뉴 (항상 표시)
    const defaultModules = [
      { id: "photos", path: "/photos", icon: "📸", label: "사진첩", description: "사진첩" },
      { id: "diary", path: "/diary", icon: "📝", label: "일기장", description: "일기장" },
    ];

    if (error) {
      return defaultModules;
    }
    
    if (loading) {
      return defaultModules; // 로딩 중에도 기본 메뉴 표시
    }

    // enabledModules가 비어있으면 기본 메뉴만 표시
    if (!enabledModules || enabledModules.length === 0) {
      return defaultModules;
    }

    const activeModules = MENU_MODULES.filter((module) =>
      enabledModules.includes(module.id)
    );

    // 활성화된 모듈이 없으면 기본 메뉴 반환
    if (activeModules.length === 0) {
      return defaultModules;
    }

    return [...activeModules].sort((a, b) => {
      const aIndex = menuOrder.indexOf(a.id);
      const bIndex = menuOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.order - b.order;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const mobileMenuData = getMobileMenuData();

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
          {/* 데스크톱: 가로 메뉴만 표시 */}
          <div className="hidden sm:block">
            <DynamicNav toggleSettings={toggleSettings} user={user} onLogout={handleLogout} />
          </div>
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
          {/* 데스크톱에서만 설정 버튼 표시 */}
          <div className="hidden sm:block">
            <IconButton label="설정" onClick={toggleSettings}>
              <GearIcon />
            </IconButton>
          </div>
          {/* 모바일: 햄버거 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-black/70 transition hover:bg-black/5 sm:hidden"
            aria-label="메뉴 열기"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일: 오른쪽에서 슬라이드되는 사이드 메뉴 */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            ref={menuRef}
            className="fixed right-0 top-0 z-50 h-full w-64 overflow-y-auto border-l border-black/10 bg-[var(--color-surface)] shadow-xl sm:hidden"
          >
            <div className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">메뉴</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                  aria-label="닫기"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav aria-label="주요 메뉴" className="flex-1">
                <ul className="space-y-1">
                  {loading ? (
                    <li>
                      <div className="rounded-[var(--radius)] px-3 py-2 text-sm text-black/50">
                        로딩 중...
                      </div>
                    </li>
                  ) : (
                    mobileMenuData.map((module) => {
                      const isActive = pathname.startsWith(module.path);
                      return (
                        <li key={module.id}>
                          <Link
                            href={module.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition ${
                              isActive
                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                : "text-black/70 hover:bg-black/5 hover:text-[var(--color-text)]"
                            }`}
                            title={module.description}
                          >
                            <span className="mr-2">{module.icon}</span>
                            {module.label}
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
              </nav>
              
              {/* 모바일 메뉴 하단: 설정 및 로그인/로그아웃 */}
              <div className="mt-auto border-t border-black/10 pt-4">
                {user && (
                  <div className="mb-2 px-3 py-2 text-xs text-black/60">
                    <div className="truncate">{user.email ?? "로그인됨"}</div>
                  </div>
                )}
                <button
                  onClick={() => {
                    toggleSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-[var(--color-text)]"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
                    />
                  </svg>
                  설정
                </button>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-2 flex w-full items-center rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-[var(--color-text)]"
                  >
                    로그인 / 회원가입
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

