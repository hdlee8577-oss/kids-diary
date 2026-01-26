import Link from "next/link";
import { siteConfig } from "@/Site.config";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="relative overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-8 shadow-sm backdrop-blur sm:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-[999px] bg-black/5 px-3 py-1 text-sm font-medium text-black/70">
            우리 가족만의 작은 아카이브
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            {siteConfig.profile.childName}의 성장 기록
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg sm:leading-8">
            {siteConfig.profile.intro}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/photos"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              사진첩 보기
            </Link>
            <Link
              href="/diary"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)]/60 px-5 text-sm font-semibold text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-surface)]"
            >
              일기장 쓰기
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/60 p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">사진첩</p>
              <p className="mt-1 text-sm leading-6 text-black/70">
                계절마다, 생일마다, 작은 순간들을 모아봐요.
              </p>
            </div>
            <div className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/60 p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">일기장</p>
              <p className="mt-1 text-sm leading-6 text-black/70">
                오늘의 웃음, 말, 표정을 짧게라도 남겨요.
              </p>
            </div>
            <div className="rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/60 p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">성장 기록</p>
              <p className="mt-1 text-sm leading-6 text-black/70">
                키·몸무게·좋아하는 것들을 천천히 업데이트해요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
