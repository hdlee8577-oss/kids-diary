"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";

export function DynamicNav() {
  const pathname = usePathname();
  const { enabledModules, menuOrder, loading, error } = useUserMenuSettings();

  // 에러 발생 시 기본 메뉴만 표시
  if (error) {
    return (
      <nav aria-label="주요 메뉴">
        <ul className="flex items-center gap-1">
          <li>
            <Link
              href="/photos"
              className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-[var(--color-text)]"
            >
              📸 사진첩
            </Link>
          </li>
          <li>
            <Link
              href="/diary"
              className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-[var(--color-text)]"
            >
              📝 일기장
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  if (loading) {
    return (
      <nav aria-label="주요 메뉴">
        <ul className="flex items-center gap-1">
          <li>
            <div className="rounded-[var(--radius)] px-3 py-2 text-sm text-black/50">
              로딩 중...
            </div>
          </li>
        </ul>
      </nav>
    );
  }

  // 활성화된 메뉴만 필터링
  const activeModules = MENU_MODULES.filter((module) =>
    enabledModules.includes(module.id)
  );

  // 사용자 지정 순서 적용
  const sortedModules = [...activeModules].sort((a, b) => {
    const aIndex = menuOrder.indexOf(a.id);
    const bIndex = menuOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return a.order - b.order;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <nav aria-label="주요 메뉴">
      <ul className="flex items-center gap-1">
        {sortedModules.map((module) => {
          const isActive = pathname.startsWith(module.path);
          return (
            <li key={module.id}>
              <Link
                href={module.path}
                className={`rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition ${
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
        })}
      </ul>
    </nav>
  );
}
