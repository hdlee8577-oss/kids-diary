"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
