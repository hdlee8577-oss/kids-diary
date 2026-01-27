"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { getAdminToken } from "@/lib/admin/clientToken";
import { siteConfig } from "@/Site.config";
import { useRouter } from "next/navigation";

type DiaryItem = {
  id: string;
  site_id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
};

type Props = {
  item: DiaryItem;
};

export function DiaryDetailClient({ item }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title || "");
  const [entryDate, setEntryDate] = useState(item.entry_date);
  const [content, setContent] = useState(item.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/diary/${item.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          siteId: siteConfig.siteId,
          title,
          content,
          entryDate,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "수정에 실패했어.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했어.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!confirm("이 일기를 삭제할까요?")) return;
    setIsDeleting(true);
    setError(null);
    try {
      const adminToken = getAdminToken();
      const res = await fetch(
        `/api/diary/${item.id}?siteId=${encodeURIComponent(siteConfig.siteId)}`,
        {
          method: "DELETE",
          headers: {
            ...(adminToken ? { "x-admin-token": adminToken } : {}),
          },
        },
      );
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "삭제에 실패했어.");
      }
      router.push("/diary");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했어.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="mt-6 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm">
      <p className="text-xs text-black/50">{item.entry_date}</p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text)] sm:text-2xl">
        {item.title || "제목 없음"}
      </h1>
      <p className="mt-2 text-xs text-black/50">
        생성: {new Date(item.created_at).toLocaleString()}
      </p>

      <div className="mt-6 grid gap-4">
        <Field label="제목">
          <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        </Field>
        <Field label="날짜">
          <Input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.currentTarget.value)}
          />
        </Field>
        <Field label="내용">
          <Textarea value={content} onChange={(e) => setContent(e.currentTarget.value)} />
        </Field>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={save} isLoading={isSaving}>
          수정 저장
        </Button>
        <Button type="button" variant="secondary" onClick={remove} isLoading={isDeleting}>
          삭제
        </Button>
      </div>
    </section>
  );
}

