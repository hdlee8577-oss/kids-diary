"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";
import type { User } from "@supabase/supabase-js";

type DynamicNavProps = {
  toggleSettings?: () => void;
  user?: User | null;
  onLogout?: () => void;
};

export function DynamicNav({ toggleSettings, user, onLogout }: DynamicNavProps = {}) {
  const pathname = usePathname();
  const { enabledModules, menuOrder, loading, error } = useUserMenuSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // 기본 메뉴 데이터 준비
  const getMenuData = () => {
    if (error) {
      return [
        { id: "photos", path: "/photos", icon: "📸", label: "사진첩", description: "사진첩" },
        { id: "diary", path: "/diary", icon: "📝", label: "일기장", description: "일기장" },
      ];
    }

    if (loading) {
      return [];
    }

    const activeModules = MENU_MODULES.filter((module) =>
      enabledModules.includes(module.id)
    );

    return [...activeModules].sort((a, b) => {
      const aIndex = menuOrder.indexOf(a.id);
      const bIndex = menuOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.order - b.order;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const sortedModules = getMenuData();

  return (
    <>
      {/* 모바일: 오른쪽 하단 고정 햄버거 버튼 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition hover:opacity-90 sm:hidden"
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

      {/* 모바일: 사이드 메뉴 */}
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
                    sortedModules.map((module) => {
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
                {toggleSettings && (
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
                )}
                {user && onLogout ? (
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
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

      {/* 데스크톱: 가로 메뉴 */}
      <nav aria-label="주요 메뉴" className="hidden sm:block">
        <ul className="flex flex-nowrap items-center gap-1">
          {loading ? (
            <li>
              <div className="rounded-[var(--radius)] px-3 py-2 text-sm text-black/50">
                로딩 중...
              </div>
            </li>
          ) : (
            sortedModules.map((module) => {
              const isActive = pathname.startsWith(module.path);
              return (
                <li key={module.id}>
                  <Link
                    href={module.path}
                    className={`inline-flex items-center whitespace-nowrap rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-black/70 hover:bg-black/5 hover:text-[var(--color-text)]"
                    }`}
                    title={module.description}
                  >
                    <span className="mr-1">{module.icon}</span>
                    {module.label}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </nav>
    </>
  );
}
