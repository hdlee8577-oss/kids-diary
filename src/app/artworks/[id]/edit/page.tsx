"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { siteConfig } from "@/Site.config";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { getAdminToken } from "@/lib/admin/clientToken";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { Select } from "@/components/shared/Select";

type ArtworkItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string | null;
  grade: string | null;
  tags: string[];
  mom_note: string | null;
  artwork_date: string | null;
  created_at: string;
};

async function fetchArtwork(id: string, siteId: string): Promise<ArtworkItem | null> {
  const res = await fetch(`/api/artworks?siteId=${encodeURIComponent(siteId)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items: ArtworkItem[] };
  return data.items.find((item) => item.id === id) ?? null;
}

async function updateArtwork(
  id: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    grade?: string;
    artworkDate?: string;
    momNote?: string;
    tags?: string[];
  },
): Promise<boolean> {
  const adminToken = getAdminToken();
  const res = await fetch("/api/artworks", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify({ id, ...updates }),
  });
  return res.ok;
}

export default function EditArtworkPage() {
  const params = useParams();
  const router = useRouter();
  const artworkId = params.id as string;
  const { user } = useSupabaseUser();
  const siteId = user?.id ?? siteConfig.siteId;

  const [artwork, setArtwork] = useState<ArtworkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [artworkDate, setArtworkDate] = useState<string>("");
  const [momNote, setMomNote] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchArtwork(artworkId, siteId);
      if (!alive) return;
      if (data) {
        setArtwork(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category || "");
        setGrade(data.grade || "");
        setArtworkDate(data.artwork_date || "");
        setMomNote(data.mom_note || "");
      }
      setIsLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [artworkId, siteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const success = await updateArtwork(artworkId, {
        title,
        description,
        category: category || undefined,
        grade: grade || undefined,
        artworkDate: artworkDate || undefined,
        momNote: momNote || undefined,
      });

      if (!success) {
        throw new Error("수정에 실패했습니다.");
      }

      router.push(`/artworks/${artworkId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 중 오류가 발생했습니다.");
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-black/60">불러오는 중…</p>
      </main>
    );
  }

  if (!artwork) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-black/60">작품을 찾을 수 없어요.</p>
        <Link
          href="/artworks"
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
        >
          작품 모음으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6">
        <Link
          href={`/artworks/${artwork.id}`}
          className="text-sm text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
        >
          ← 상세 페이지로
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">작품 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="제목" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="작품 제목"
          />
        </Field>
        <Field label="설명">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="작품에 대한 설명을 입력해주세요"
            rows={3}
          />
        </Field>
        <Field label="작품 날짜">
          <Input
            type="date"
            value={artworkDate}
            onChange={(e) => setArtworkDate(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="카테고리">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">선택 안 함</option>
              <option value="Art">Art</option>
              <option value="STEM">STEM</option>
              <option value="Writing">Writing</option>
              <option value="Music">Music</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
          <Field label="학년">
            <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">선택 안 함</option>
              <option value="Pre-K">Pre-K</option>
              <option value="K">K</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
              <option value="5th">5th</option>
              <option value="6th">6th</option>
              <option value="7th">7th</option>
              <option value="8th">8th</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </Select>
          </Field>
        </div>
        <Field label="엄마의 한마디">
          <Textarea
            value={momNote}
            onChange={(e) => setMomNote(e.target.value)}
            placeholder="이 작품에 대한 생각이나 느낌을 남겨주세요"
            rows={2}
          />
        </Field>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "저장 중..." : "수정 완료"}
          </Button>
          <Link
            href={`/artworks/${artwork.id}`}
            className="rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] px-6 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-black/5"
          >
            취소
          </Link>
        </div>
      </form>
    </main>
  );
}
