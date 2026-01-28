"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";

export function DynamicNav() {
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
      {/* 모바일: 햄버거 메뉴 버튼 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden flex h-8 w-8 items-center justify-center rounded-[var(--radius)] text-black/70 hover:bg-black/5"
        aria-label="메뉴 열기"
      >
        <svg
          className="h-5 w-5"
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
            <div className="p-4">
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
              <nav aria-label="주요 메뉴">
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
