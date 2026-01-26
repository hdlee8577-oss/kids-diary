"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { getAdminToken } from "@/lib/admin/clientToken";
import { siteConfig } from "@/Site.config";

type Props = {
  photoId: string;
  imageUrl: string;
  initialX?: number | null;
  initialY?: number | null;
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function ThumbnailPositionEditor({ photoId, imageUrl, initialX, initialY }: Props) {
  const [x, setX] = useState(() => clamp(typeof initialX === "number" ? initialX : 50));
  const [y, setY] = useState(() => clamp(typeof initialY === "number" ? initialY : 50));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);

  const objectPosition = useMemo(() => `${x}% ${y}%`, [x, y]);

  function onPointerDown(e: React.PointerEvent) {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: x,
      startY: y,
      width: rect.width || 1,
      height: rect.height || 1,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    // Dragging image left should reveal right -> increase x when dx is negative.
    const dx = e.clientX - d.startClientX;
    const dy = e.clientY - d.startClientY;
    setX(clamp(d.startX - (dx / d.width) * 100));
    setY(clamp(d.startY - (dy / d.height) * 100));
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          siteId: siteConfig.siteId,
          thumbPosX: x,
          thumbPosY: y,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || "저장에 실패했어.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        썸네일 위치 조절
      </h2>
      <p className="mt-2 text-sm text-black/60">
        아래 이미지를 드래그해서 썸네일에 보일 위치를 맞춘 뒤 저장해줘.
      </p>

      <div
        ref={boxRef}
        className="mt-4 relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] border border-black/10 bg-black/5 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Image
          src={imageUrl}
          alt="thumbnail preview"
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-zinc-900">
          {Math.round(x)}% · {Math.round(y)}%
        </div>
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={save} isLoading={isSaving}>
          저장
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setX(50);
            setY(50);
          }}
          disabled={isSaving}
        >
          가운데로 리셋
        </Button>
      </div>
    </section>
  );
}

