"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { getAdminToken } from "@/lib/admin/clientToken";
import exifr from "exifr";

type PhotoItem = {
  id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
  thumb_pos_x?: number;
  thumb_pos_y?: number;
  created_at: string;
};

type UploadDraft = {
  id: string;
  file: File;
  title: string;
  takenAt: string;
  isLoadingTitle: boolean;
};

async function fetchPhotos(siteId: string): Promise<PhotoItem[]> {
  const res = await fetch(`/api/photos?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: PhotoItem[] };
  return data.items ?? [];
}

export default function PhotosPage() {
  const layoutMode = useSiteSettingsStore((s) => s.theme.layout.mode);
  const thumbnailSize = useSiteSettingsStore((s) => s.theme.gallery.thumbnailSize);
  const siteId = siteConfig.siteId;

  const [items, setItems] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(""); // default for all files (optional)
  const [takenAt, setTakenAt] = useState<string>(""); // default override for all files (optional)
  const [drafts, setDrafts] = useState<UploadDraft[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, true>>({});

  const modeLabel = useMemo(
    () => (layoutMode === "timeline" ? "타임라인형" : "카드형"),
    [layoutMode],
  );

  const gridClass = useMemo(() => {
    if (layoutMode === "timeline") return "mt-4 grid gap-4";
    // cards
    const baseCols =
      thumbnailSize === "sm"
        ? "grid-cols-3"
        : thumbnailSize === "lg"
          ? "grid-cols-1"
          : "grid-cols-2";
    const smCols =
      thumbnailSize === "sm"
        ? "sm:grid-cols-4"
        : thumbnailSize === "lg"
          ? "sm:grid-cols-2"
          : "sm:grid-cols-3";
    return `mt-4 grid ${baseCols} gap-4 ${smCols}`;
  }, [layoutMode, thumbnailSize]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const list = await fetchPhotos(siteId);
      if (!alive) return;
      setItems(list);
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [siteId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (drafts.length === 0) {
      setError("사진 파일을 1개 이상 선택해줘.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setUploadProgress({ done: 0, total: drafts.length });

    try {
      const adminToken = getAdminToken();
      const failed: Array<{ name: string; error: string }> = [];
      const succeeded: string[] = [];

      for (let i = 0; i < drafts.length; i++) {
        const d = drafts[i];
        const fd = new FormData();
        fd.set("siteId", siteId);
        if (title) fd.set("title", title);
        if (takenAt) fd.set("takenAt", takenAt);
        fd.set("file", d.file);
        fd.set(
          "meta",
          JSON.stringify([
            {
              title: d.title,
              takenAt: d.takenAt,
            },
          ]),
        );

        const res = await fetch("/api/photos", {
          method: "POST",
          headers: adminToken ? { "x-admin-token": adminToken } : undefined,
          body: fd,
        });

        const j = (await res.json().catch(() => null)) as
          | { ok?: boolean; ids?: string[]; errors?: Array<{ name: string; error: string }>; error?: string }
          | null;

        if (!res.ok || j?.ok === false) {
          const msg =
            j?.error ||
            j?.errors?.[0]?.error ||
            "업로드에 실패했어.";
          failed.push({ name: d.file.name, error: msg });
        } else {
          const id = j?.ids?.[0];
          if (id) succeeded.push(id);
        }

        setUploadProgress({ done: i + 1, total: drafts.length });
      }

      if (failed.length > 0) {
        setError(
          `일부 업로드 실패 (${failed.length}/${drafts.length})\n` +
            failed.map((f) => `- ${f.name}: ${f.error}`).join("\n"),
        );
        // keep failed files in draft list
        setDrafts((prev) =>
          prev.filter((d) => failed.some((f) => f.name === d.file.name)),
        );
      } else {
        setError(null);
        setDrafts([]);
        setTitle("");
        setTakenAt("");
      }

      const list = await fetchPhotos(siteId);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했어.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  const selectedCount = useMemo(
    () => Object.keys(selectedIds).length,
    [selectedIds],
  );

  async function deleteSelected() {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`선택한 사진 ${ids.length}개를 삭제할까요?`)) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/photos", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({ siteId, ids }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "삭제에 실패했어.");
      }
      setSelectedIds({});
      setIsSelectMode(false);
      const list = await fetchPhotos(siteId);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: true };
    });
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
            사진첩
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
            현재 레이아웃: <span className="font-semibold">{modeLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsSelectMode((v) => !v);
              setSelectedIds({});
            }}
            disabled={isSubmitting || isLoading}
          >
            {isSelectMode ? "선택 해제" : "선택"}
          </Button>
          {isSelectMode ? (
            <Button
              type="button"
              size="sm"
              onClick={deleteSelected}
              disabled={isSubmitting || selectedCount === 0}
            >
              선택 삭제 ({selectedCount})
            </Button>
          ) : null}
        </div>
      </div>

      <section className="mt-8 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          사진 추가
        </h2>
        <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
          <Field label="제목 (선택)">
            <Input
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              placeholder="비워두면 위치(가능한 경우)로 자동 생성"
            />
          </Field>
          <Field label="촬영일 (선택: 비워두면 사진정보(EXIF)에서 자동)">
            <Input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.currentTarget.value)}
            />
          </Field>
          <Field label="사진 파일(여러 개 선택 가능)">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const list = Array.from(e.currentTarget.files ?? []);
                const newDrafts: UploadDraft[] = list.map((file) => ({
                  id: crypto.randomUUID(),
                  file,
                  title: "",
                  takenAt: "",
                  isLoadingTitle: false,
                }));
                setDrafts(newDrafts);

                // Fill preview meta from EXIF (date + GPS->title)
                newDrafts.forEach(async (d) => {
                  try {
                    const parsed = (await exifr.parse(d.file, {
                      exif: true,
                      tiff: true,
                      gps: true,
                    })) as unknown;
                    const p = parsed as {
                      DateTimeOriginal?: Date;
                      CreateDate?: Date;
                      ModifyDate?: Date;
                      latitude?: number;
                      longitude?: number;
                    };
                    const date =
                      (p?.DateTimeOriginal instanceof Date && !Number.isNaN(p.DateTimeOriginal.getTime())
                        ? p.DateTimeOriginal
                        : p?.CreateDate instanceof Date && !Number.isNaN(p.CreateDate.getTime())
                          ? p.CreateDate
                          : p?.ModifyDate instanceof Date && !Number.isNaN(p.ModifyDate.getTime())
                            ? p.ModifyDate
                            : null);
                    const taken = date ? date.toISOString().slice(0, 10) : "";
                    const lat = typeof p?.latitude === "number" ? p.latitude : null;
                    const lon = typeof p?.longitude === "number" ? p.longitude : null;

                    setDrafts((prev) =>
                      prev.map((x) =>
                        x.id !== d.id
                          ? x
                          : {
                              ...x,
                              takenAt: x.takenAt || taken,
                              isLoadingTitle: Boolean(lat && lon),
                            },
                      ),
                    );

                    if (lat && lon) {
                      const res = await fetch(
                        `/api/geocode?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
                      );
                      if (res.ok) {
                        const j = (await res.json()) as { title?: string | null };
                        const guessed = (j.title || "").trim();
                        if (guessed) {
                          setDrafts((prev) =>
                            prev.map((x) =>
                              x.id !== d.id
                                ? x
                                : {
                                    ...x,
                                    title: x.title || guessed,
                                    isLoadingTitle: false,
                                  },
                            ),
                          );
                        }
                      }
                    }
                  } catch {
                    // ignore
                  } finally {
                    setDrafts((prev) =>
                      prev.map((x) =>
                        x.id !== d.id ? x : { ...x, isLoadingTitle: false },
                      ),
                    );
                  }
                });
              }}
            />
          </Field>
          {drafts.length > 0 ? (
            <div className="grid gap-3 rounded-[var(--radius)] border border-black/5 bg-white/40 p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                업로드 미리보기(파일별)
              </p>
              <div className="grid gap-3">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className="grid gap-2 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-black/60">{d.file.name}</p>
                      <button
                        type="button"
                        className="rounded-[999px] bg-black/5 px-2 py-1 text-xs font-semibold text-black/70 hover:bg-black/10"
                        onClick={() => removeDraft(d.id)}
                      >
                        제거
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={d.title}
                        onChange={(e) =>
                          setDrafts((prev) =>
                            prev.map((x) =>
                              x.id !== d.id ? x : { ...x, title: e.currentTarget.value },
                            ),
                          )
                        }
                        placeholder={
                          d.isLoadingTitle ? "위치로 제목 추정 중..." : "제목(선택)"
                        }
                      />
                      <Input
                        type="date"
                        value={d.takenAt}
                        onChange={(e) =>
                          setDrafts((prev) =>
                            prev.map((x) =>
                              x.id !== d.id ? x : { ...x, takenAt: e.currentTarget.value },
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm font-medium text-red-600">{error}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting && uploadProgress
                ? `업로드 중... (${uploadProgress.done}/${uploadProgress.total})`
                : `추가하기 (${drafts.length})`}
            </Button>
            <p className="text-xs text-black/50">
              * Supabase 설정이 안 되어 있으면 저장이 동작하지 않을 수 있어요.
            </p>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          사진 목록
        </h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-black/60">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-black/60">아직 사진이 없어요.</p>
        ) : (
          <div
            className={gridClass}
          >
            {items.map((it) => (
              <article
                key={it.id}
                className="overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 shadow-sm"
              >
                {isSelectMode ? (
                  <button
                    type="button"
                    onClick={() => toggleSelected(it.id)}
                    className="relative block w-full text-left"
                  >
                    <div className="relative aspect-[4/3] bg-black/5">
                      <Image
                        src={it.image_url}
                        alt={it.title || "photo"}
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: `${it.thumb_pos_x ?? 50}% ${it.thumb_pos_y ?? 50}%`,
                        }}
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-zinc-900">
                        {selectedIds[it.id] ? "선택됨" : "선택"}
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link href={`/photos/${it.id}`} className="block">
                    <div className="relative aspect-[4/3] bg-black/5">
                      <Image
                        src={it.image_url}
                        alt={it.title || "photo"}
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: `${it.thumb_pos_x ?? 50}% ${it.thumb_pos_y ?? 50}%`,
                        }}
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-4">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {it.title || "제목 없음"}
                  </p>
                  <p className="mt-1 text-xs text-black/50">
                    {it.taken_at ? `촬영일 ${it.taken_at}` : "촬영일 없음"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

