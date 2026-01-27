import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { DiaryDetailClient } from "@/components/diary/DiaryDetailClient";

type DiaryItem = {
  id: string;
  site_id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
};

async function fetchDiary(id: string): Promise<DiaryItem | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(siteConfig.data.diary.table)
    .select("id, site_id, title, content, entry_date, created_at")
    .eq("id", id)
    .maybeSingle<DiaryItem>();

  if (error) return null;
  return data ?? null;
}

export default async function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await fetchDiary(id);
  if (!item) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/diary"
          className="text-sm font-semibold text-black/70 hover:text-[var(--color-text)]"
        >
          ← 일기장으로
        </Link>
      </div>

      <DiaryDetailClient item={item} />
    </main>
  );
}

