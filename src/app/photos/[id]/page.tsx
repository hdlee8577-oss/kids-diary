import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { ThumbnailPositionEditor } from "@/components/photos/ThumbnailPositionEditor";

type PhotoItem = {
  id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
  thumb_pos_x: number | null;
  thumb_pos_y: number | null;
  created_at: string;
};

async function fetchPhoto(id: string): Promise<PhotoItem | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(siteConfig.data.photos.table)
    .select("id, title, image_url, taken_at, thumb_pos_x, thumb_pos_y, created_at")
    .eq("id", id)
    .maybeSingle<PhotoItem>();

  if (error) return null;
  return data ?? null;
}

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await fetchPhoto(id);
  if (!item) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/photos"
          className="text-sm font-semibold text-black/70 hover:text-[var(--color-text)]"
        >
          ← 사진첩으로
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 shadow-sm">
        <div className="relative aspect-[16/10] bg-black/5">
          <Image
            src={item.image_url}
            alt={item.title || "photo"}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
        <div className="p-5">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)] sm:text-2xl">
            {item.title || "제목 없음"}
          </h1>
          <p className="mt-2 text-sm text-black/60">
            {item.taken_at ? `촬영일 ${item.taken_at}` : "촬영일 없음"} ·{" "}
            {new Date(item.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <ThumbnailPositionEditor
        photoId={item.id}
        imageUrl={item.image_url}
        initialX={item.thumb_pos_x}
        initialY={item.thumb_pos_y}
      />
    </main>
  );
}

