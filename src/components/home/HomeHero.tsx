"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { siteConfig } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { getAdminToken } from "@/lib/admin/clientToken";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export function HomeHero() {
  const { user } = useSupabaseUser();
  const profile = useSiteSettingsStore((s) => s.profile);
  const setProfile = useSiteSettingsStore((s) => s.setProfile);
  const theme = useSiteSettingsStore((s) => s.theme);
  const siteId = user?.id ?? siteConfig.siteId;

  const [isUploading, setIsUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = profile.childName || siteConfig.profile.childName;
  const intro = profile.intro || siteConfig.profile.intro;
  const mood = theme.homeMood || siteConfig.defaults.theme.homeMood || {
    accentColor1: "#FECDD3",
    accentColor2: "#FDE68A",
    character: "🌸",
    preset: "warm",
  };

  const profilePhotoUrl = profile.profilePhotoUrl;
  const profilePhotoShape = profile.profilePhotoShape || "circle";
  const birthDate = profile.birthDate;

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 생일로부터 나이 계산
  const getAge = (birthDate: string | undefined): string | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}세`;
  };

  const age = getAge(birthDate);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      alert("지원하지 않는 파일 형식입니다.\n지원 형식: JPG, PNG, GIF, WEBP");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`파일 크기가 너무 큽니다.\n최대 크기: 5MB\n선택한 파일: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const adminToken = getAdminToken();
      const formData = new FormData();
      formData.append("siteId", siteId);
      formData.append("file", file);

      const res = await fetch("/api/profile-photo", {
        method: "POST",
        headers: {
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "업로드 실패");
      }

      const data = (await res.json()) as { photoUrl: string };
      setProfile({ profilePhotoUrl: data.photoUrl });
      
      const currentTheme = useSiteSettingsStore.getState().theme;
      const settingsRes = await fetch("/api/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          settings: {
            profile: {
              ...profile,
              profilePhotoUrl: data.photoUrl,
            },
            theme: currentTheme,
          },
        }),
      });

      if (!settingsRes.ok) {
        console.warn("프로필 사진 URL 저장 실패");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDeletePhoto() {
    if (!confirm("프로필 사진을 삭제하시겠어요?")) return;

    try {
      const adminToken = getAdminToken();
      const updatedProfile = { ...profile };
      delete updatedProfile.profilePhotoUrl;

      setProfile(updatedProfile);

      const currentTheme = useSiteSettingsStore.getState().theme;
      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          settings: {
            profile: updatedProfile,
            theme: currentTheme,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("삭제 실패");
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  function handleShapeChange(shape: "circle" | "square" | "rounded") {
    setProfile({ profilePhotoShape: shape });
    
    const adminToken = getAdminToken();
    const currentTheme = useSiteSettingsStore.getState().theme;
    fetch("/api/site-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(adminToken ? { "x-admin-token": adminToken } : {}),
      },
      body: JSON.stringify({
        settings: {
          profile: {
            ...profile,
            profilePhotoShape: shape,
          },
          theme: currentTheme,
        },
      }),
    }).catch(() => {
      console.warn("프로필 사진 모양 저장 실패");
    });
  }

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-none",
    rounded: "rounded-[var(--radius)]",
  };

  return (
    <section className="relative overflow-hidden rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-8 shadow-sm backdrop-blur sm:p-12">
      <div className="pointer-events-none absolute inset-0">
        <div 
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl" 
          style={{ backgroundColor: `${mood.accentColor1}66` }}
        />
        <div 
          className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl" 
          style={{ backgroundColor: `${mood.accentColor2}66` }}
        />
      </div>

      <div className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* 왼쪽: 텍스트 콘텐츠 */}
          <div className="flex-1">
            <p className="inline-flex items-center gap-2 rounded-[999px] bg-black/5 px-3 py-1 text-sm font-medium text-black/70">
              <span className="text-lg">{mood.character || "🌸"}</span>
              우리 가족만의 작은 아카이브
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
              {name}의 성장 기록
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg sm:leading-8">
              {intro}
            </p>
            {birthDate && (
              <div className="mt-4 text-sm text-black/70">
                <span>
                  생일: {new Date(birthDate).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {age && <span className="ml-2">• {age}</span>}
              </div>
            )}
          </div>

          {/* 오른쪽: 프로필 사진 */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            {profilePhotoUrl ? (
              <div
                className={`relative h-32 w-32 overflow-hidden border-4 border-white shadow-lg sm:h-40 sm:w-40 ${shapeClasses[profilePhotoShape]}`}
              >
                <Image
                  src={profilePhotoUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>
            ) : (
              <div
                className={`flex h-32 w-32 items-center justify-center border-4 border-white bg-gradient-to-br from-pink-200 to-amber-200 text-5xl shadow-lg sm:h-40 sm:w-40 ${shapeClasses[profilePhotoShape]}`}
              >
                👶
              </div>
            )}
            
            {/* 편집 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition hover:opacity-90"
              aria-label="프로필 사진 편집"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            {/* 메뉴 - 위쪽으로 열리도록 수정 */}
            {isMenuOpen && (
              <div className="absolute right-0 bottom-full z-[100] mb-2 min-w-[200px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-lg">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsMenuOpen(false);
                  }}
                  disabled={isUploading}
                  className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-black/5 first:rounded-t-[var(--radius)]"
                >
                  {profilePhotoUrl ? "사진 변경" : "사진 업로드"}
                </button>
                {profilePhotoUrl && (
                  <button
                    onClick={() => {
                      handleDeletePhoto();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    사진 삭제
                  </button>
                )}
                <div className="border-t border-black/10 px-4 py-2">
                  <p className="mb-2 text-xs font-medium text-black/60">모양 선택</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleShapeChange("circle");
                        setIsMenuOpen(false);
                      }}
                      className={`h-8 w-8 rounded-full border-2 ${
                        profilePhotoShape === "circle"
                          ? "border-[var(--color-primary)]"
                          : "border-black/20"
                      }`}
                      aria-label="동그라미"
                    />
                    <button
                      onClick={() => {
                        handleShapeChange("rounded");
                        setIsMenuOpen(false);
                      }}
                      className={`h-8 w-8 rounded-[var(--radius)] border-2 ${
                        profilePhotoShape === "rounded"
                          ? "border-[var(--color-primary)]"
                          : "border-black/20"
                      }`}
                      aria-label="둥근 모서리"
                    />
                    <button
                      onClick={() => {
                        handleShapeChange("square");
                        setIsMenuOpen(false);
                      }}
                      className={`h-8 w-8 border-2 ${
                        profilePhotoShape === "square"
                          ? "border-[var(--color-primary)]"
                          : "border-black/20"
                      }`}
                      aria-label="사각형"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
  );
}

