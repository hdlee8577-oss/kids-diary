import Link from "next/link";

const links = [
  { href: "/", label: "홈" },
  { href: "/photos", label: "사진첩" },
  { href: "/diary", label: "일기장" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          성장 기록
        </Link>
        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-black/5 hover:text-zinc-900"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

