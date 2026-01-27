"use client";

import Link from "next/link";
import { IconButton } from "@/components/shared/IconButton";
import { useThemeUI } from "@/theme/ThemeProvider";
import { Mascot } from "@/components/cute/Mascot";

const links = [
  { href: "/", label: "홈" },
  { href: "/photos", label: "사진첩" },
  { href: "/diary", label: "일기장" },
] as const;

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a8.1 8.1 0 0 0 .1-1 8.1 8.1 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1l-.3-2.6H10l-.3 2.6a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a8.1 8.1 0 0 0-.1 1 8.1 8.1 0 0 0 .1 1l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.3 2.6h4.7l.3-2.6a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const { toggleSettings } = useThemeUI();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-surface)]/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-7 w-7">
            <Mascot className="h-full w-full" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
            성장 기록
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label="주요 메뉴">
            <ul className="flex items-center gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-[var(--color-text)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <IconButton label="설정" onClick={toggleSettings}>
            <GearIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

