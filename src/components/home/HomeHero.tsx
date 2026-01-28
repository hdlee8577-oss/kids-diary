"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { siteConfig, type SiteSettings } from "@/Site.config";
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
  const photoZoom = profile.profilePhotoZoom ?? 1;
  const photoOffsetX = profile.profilePhotoOffsetX ?? 0;
  const photoOffsetY = profile.profilePhotoOffsetY ?? 0;

  // 디버깅: 프로필 사진 URL 확인
  useEffect(() => {
    console.log("[Profile] 현재 profilePhotoUrl:", profilePhotoUrl);
    console.log("[Profile] 전체 profile:", profile);
  }, [profilePhotoUrl, profile]);

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

  // 생일로부터 나이 계산 (타임존 문제 방지를 위해 문자열 직접 파싱)
  const getAge = (birthDate: string | undefined): number | null => {
    if (!birthDate) return null;
    try {
      // YYYY-MM-DD 형식에서 직접 파싱
      const [year, month, day] = birthDate.split("-").map(Number);
      if (!year || !month || !day) return null;
      
      const birth = new Date(year, month - 1, day); // month는 0부터 시작
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // 생일 포맷팅 (YYYY-MM-DD 형식을 한국어 형식으로, 타임존 문제 방지)
  const formatBirthDate = (birthDate: string | undefined): string | null => {
    if (!birthDate) return null;
    try {
      // YYYY-MM-DD 형식에서 직접 파싱하여 타임존 문제 방지
      const [year, month, day] = birthDate.split("-").map(Number);
      if (!year || !month || !day) return null;
      
      // 로컬 날짜로 직접 생성 (타임존 변환 없이)
      const date = new Date(year, month - 1, day); // month는 0부터 시작
      
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  const age = getAge(birthDate);
  const formattedBirthDate = formatBirthDate(birthDate);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("[Profile] 🎯 handleFileChange 호출됨");
    console.log("[Profile] 이벤트 타겟:", e.target);
    console.log("[Profile] files 객체:", e.target.files);
    console.log("[Profile] files.length:", e.target.files?.length ?? 0);
    
    const file = e.target.files?.[0];
    console.log("[Profile] 선택된 파일:", file ? `${file.name} (${file.size} bytes, ${file.type})` : "없음");
    
    if (!file) {
      console.log("[Profile] ❌ 파일이 선택되지 않음 - 함수 종료");
      return;
    }
    
    console.log("[Profile] ✅ 파일 선택됨:", file.name, file.size, "bytes", file.type);

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
      console.log("[Profile] ✅ 업로드된 사진 URL:", data.photoUrl);
      console.log("[Profile] 현재 siteId:", siteId);
      
      // 현재 프로필과 테마 가져오기
      const currentProfile = useSiteSettingsStore.getState().profile;
      const currentTheme = useSiteSettingsStore.getState().theme;
      console.log("[Profile] 현재 프로필:", currentProfile);
      
      // 업데이트할 프로필 생성
      const updatedProfile = {
        ...currentProfile,
        profilePhotoUrl: data.photoUrl,
      };
      console.log("[Profile] 업데이트할 프로필:", updatedProfile);
      console.log("[Profile] profilePhotoUrl 포함 여부:", "profilePhotoUrl" in updatedProfile);
      console.log("[Profile] profilePhotoUrl 값:", updatedProfile.profilePhotoUrl);
      
      // 설정 저장 (userId 사용) - 상태 업데이트 전에 먼저 저장
      const settingsPayload = {
        userId: siteId,
        settings: {
          profile: updatedProfile,
          theme: currentTheme,
        },
      };
      console.log("[Profile] 저장할 설정 (전체):", JSON.stringify(settingsPayload, null, 2));
      console.log("[Profile] 저장할 프로필만:", JSON.stringify(settingsPayload.settings.profile, null, 2));
      
      const settingsRes = await fetch("/api/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify(settingsPayload),
      });

      const settingsResponseText = await settingsRes.text();
      console.log("[Profile] 설정 저장 응답 상태:", settingsRes.status);
      console.log("[Profile] 설정 저장 응답:", settingsResponseText);

      if (!settingsRes.ok) {
        let errorData;
        try {
          errorData = JSON.parse(settingsResponseText);
        } catch {
          errorData = { message: settingsResponseText };
        }
        console.error("[Profile] ❌ 프로필 사진 URL 저장 실패:", errorData);
        // 에러는 콘솔에만 표시 (사용자 경험 개선)
        console.warn("[Profile] ⚠️ 설정 저장 실패 - 페이지를 새로고침하면 반영될 수 있습니다.");
      } else {
        let saveResult;
        try {
          saveResult = JSON.parse(settingsResponseText);
        } catch {
          saveResult = { ok: true };
        }
        console.log("[Profile] ✅ 프로필 사진 URL 저장 완료:", saveResult);
        
        // 저장 성공 후 상태 업데이트 (이미 위에서 했지만 확실히 하기 위해 다시)
        setProfile({ profilePhotoUrl: data.photoUrl });
        console.log("[Profile] ✅ 상태 업데이트 완료, profilePhotoUrl:", data.photoUrl);
        
        // 저장된 데이터 확인을 위해 다시 조회
        const verifyRes = await fetch(`/api/site-settings?userId=${encodeURIComponent(siteId)}`);
        if (verifyRes.ok) {
          const verifyData = (await verifyRes.json()) as { settings?: SiteSettings | null };
          console.log("[Profile] 저장 후 확인:", verifyData.settings?.profile);
          
          // 저장된 데이터로 상태 동기화
          if (verifyData.settings?.profile?.profilePhotoUrl) {
            setProfile({ profilePhotoUrl: verifyData.settings.profile.profilePhotoUrl });
            console.log("[Profile] ✅ 저장된 데이터로 상태 동기화 완료");
          }
        }
        
        // 팝업 없이 조용히 완료 (이미지가 즉시 표시됨)
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

  // 프로필 사진 확대/이동 설정 저장
  function updatePhotoTransform(updates: {
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
  }) {
    const currentProfile = useSiteSettingsStore.getState().profile;
    const updatedProfile = {
      ...currentProfile,
      profilePhotoZoom:
        updates.zoom !== undefined
          ? updates.zoom
          : currentProfile.profilePhotoZoom ?? 1,
      profilePhotoOffsetX:
        updates.offsetX !== undefined
          ? updates.offsetX
          : currentProfile.profilePhotoOffsetX ?? 0,
      profilePhotoOffsetY:
        updates.offsetY !== undefined
          ? updates.offsetY
          : currentProfile.profilePhotoOffsetY ?? 0,
    };

    // 상태 업데이트 (부분 업데이트)
    setProfile({
      profilePhotoZoom: updatedProfile.profilePhotoZoom,
      profilePhotoOffsetX: updatedProfile.profilePhotoOffsetX,
      profilePhotoOffsetY: updatedProfile.profilePhotoOffsetY,
    });

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
          profile: updatedProfile,
          theme: currentTheme,
        },
      }),
    }).catch(() => {
      console.warn("프로필 사진 편집 옵션 저장 실패");
    });
  }

  return (
    <section className="relative overflow-visible rounded-[var(--radius)] border border-black/5 bg-[var(--color-surface)]/70 p-4 shadow-sm backdrop-blur sm:overflow-hidden sm:p-12">
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
          </div>

          {/* 오른쪽: 프로필 사진 */}
          <div className="relative flex flex-shrink-0 flex-col items-center" ref={menuRef}>
            {/* 파일 input을 메뉴 밖에 배치 (메뉴가 닫혀도 유지되도록) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => {
                console.log("[Profile] 🎯 input onChange 이벤트 발생");
                console.log("[Profile] 선택된 파일들:", e.target.files);
                console.log("[Profile] 파일 개수:", e.target.files?.length ?? 0);
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e);
                } else {
                  console.log("[Profile] ⚠️ 파일이 선택되지 않음 (onChange는 발생했지만 파일 없음)");
                }
              }}
              onClick={(e) => {
                console.log("[Profile] 🎯 input 클릭됨");
              }}
              className="hidden"
            />
            <div className="relative">
              {profilePhotoUrl ? (
                <div
                  className={`relative h-32 w-32 overflow-hidden border-4 border-white shadow-lg sm:h-40 sm:w-40 ${shapeClasses[profilePhotoShape]}`}
                >
                  {/* 일반 img 태그 사용 (Next.js Image 캐싱 문제 우회) */}
                  <img
                    key={profilePhotoUrl} // URL만 key로 사용 (타임스탬프 제거)
                    src={`${profilePhotoUrl}?t=${Date.now()}`}
                    alt={name}
                    className="h-full w-full object-cover"
                    style={{
                      transform: `translate(${photoOffsetX}%, ${photoOffsetY}%) scale(${photoZoom})`,
                      transformOrigin: "center",
                    }}
                    onError={(e) => {
                      console.error("[Profile] 이미지 로드 실패:", profilePhotoUrl);
                      // 이미지 로드 실패 시 기본 아이콘으로 대체
                      const target = e.target as HTMLImageElement;
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center text-5xl">👶</div>';
                      }
                    }}
                    onLoad={() => {
                      console.log("[Profile] ✅ 이미지 로드 성공:", profilePhotoUrl);
                    }}
                  />
                </div>
              ) : (
                <div
                  className={`flex h-32 w-32 items-center justify-center border-4 border-white bg-gradient-to-br from-pink-200 to-amber-200 text-5xl shadow-lg sm:h-40 sm:w-40 ${shapeClasses[profilePhotoShape]}`}
                >
                  👶
                </div>
              )}
              
              {/* 편집 버튼 - 사진 우측 상단에 배치 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("[Profile] 🎯 편집 버튼 클릭, 현재 isMenuOpen:", isMenuOpen);
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition hover:opacity-90"
                aria-label="프로필 사진 편집"
              >
              <svg
                className="h-4 w-4"
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
            </div>

            {/* 생일 정보 - 사진 밑에 표시 */}
            {formattedBirthDate && (
              <div className="mt-3 text-center text-sm text-black/70">
                {formattedBirthDate}
                {age !== null && ` (${age}세)`}
              </div>
            )}

            {/* 메뉴 - 모바일에서는 중앙 모달, 데스크톱에서는 드롭다운 */}
            {isMenuOpen && (
              <>
                {/* 모바일: 전체 화면 오버레이 + 중앙 모달 */}
                <div 
                  className="fixed inset-0 z-40 bg-black/20 sm:hidden"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-xl sm:hidden">
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">프로필 사진 편집</h3>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5"
                        aria-label="닫기"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("[Profile] 🎯 사진 업로드 버튼 클릭");
                          if (fileInputRef.current) {
                            setIsMenuOpen(false);
                            await new Promise(resolve => setTimeout(resolve, 100));
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={isUploading}
                        className="block w-full rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                      >
                        {profilePhotoUrl ? "사진 변경" : "사진 업로드"}
                      </button>
                      {profilePhotoUrl && (
                        <button
                          onClick={() => {
                            handleDeletePhoto();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600 hover:bg-red-100"
                        >
                          사진 삭제
                        </button>
                      )}
                      <div className="border-t border-black/10 pt-3">
                        <p className="mb-3 text-xs font-medium text-black/60">모양 선택</p>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              handleShapeChange("circle");
                              setIsMenuOpen(false);
                            }}
                            className={`h-10 w-10 rounded-full border-2 ${
                              profilePhotoShape === "circle"
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                : "border-black/20"
                            }`}
                            aria-label="동그라미"
                          />
                          <button
                            onClick={() => {
                              handleShapeChange("rounded");
                              setIsMenuOpen(false);
                            }}
                            className={`h-10 w-10 rounded-[var(--radius)] border-2 ${
                              profilePhotoShape === "rounded"
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                : "border-black/20"
                            }`}
                            aria-label="둥근 모서리"
                          />
                          <button
                            onClick={() => {
                              handleShapeChange("square");
                              setIsMenuOpen(false);
                            }}
                            className={`h-10 w-10 border-2 ${
                              profilePhotoShape === "square"
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                : "border-black/20"
                            }`}
                            aria-label="사각형"
                          />
                        </div>
                        {/* 확대 / 위치 조정 */}
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium text-black/60">확대 / 위치 조정</p>
                          <label className="flex items-center gap-2">
                            <span className="w-14 text-[11px] text-black/50">확대</span>
                            <input
                              type="range"
                              min={1}
                              max={2.5}
                              step={0.05}
                              value={photoZoom}
                              onChange={(e) =>
                                updatePhotoTransform({
                                  zoom: Number(e.currentTarget.value),
                                })
                              }
                              className="flex-1"
                            />
                          </label>
                          <label className="flex items-center gap-2">
                            <span className="w-14 text-[11px] text-black/50">가로</span>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              step={1}
                              value={photoOffsetX}
                              onChange={(e) =>
                                updatePhotoTransform({
                                  offsetX: Number(e.currentTarget.value),
                                })
                              }
                              className="flex-1"
                            />
                          </label>
                          <label className="flex items-center gap-2">
                            <span className="w-14 text-[11px] text-black/50">세로</span>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              step={1}
                              value={photoOffsetY}
                              onChange={(e) =>
                                updatePhotoTransform({
                                  offsetY: Number(e.currentTarget.value),
                                })
                              }
                              className="flex-1"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 데스크톱: 드롭다운 메뉴 */}
                <div className="absolute left-0 top-full z-[100] mt-2 hidden min-w-[200px] rounded-[var(--radius)] border border-black/10 bg-[var(--color-surface)] shadow-xl sm:block">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("[Profile] 🎯 사진 업로드 버튼 클릭");
                    console.log("[Profile] fileInputRef.current:", fileInputRef.current);
                    
                    if (fileInputRef.current) {
                      // 메뉴를 먼저 닫고
                      setIsMenuOpen(false);
                      
                      // 약간의 지연 후 파일 선택 다이얼로그 열기
                      await new Promise(resolve => setTimeout(resolve, 100));
                      
                      fileInputRef.current.click();
                      console.log("[Profile] ✅ 파일 input 클릭 트리거됨");
                    } else {
                      console.error("[Profile] ❌ fileInputRef가 null");
                    }
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
                  {/* 확대 / 위치 조정 */}
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-black/60">확대 / 위치 조정</p>
                    <label className="flex items-center gap-2">
                      <span className="w-14 text-[11px] text-black/50">확대</span>
                      <input
                        type="range"
                        min={1}
                        max={2.5}
                        step={0.05}
                        value={photoZoom}
                        onChange={(e) =>
                          updatePhotoTransform({
                            zoom: Number(e.currentTarget.value),
                          })
                        }
                        className="flex-1"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="w-14 text-[11px] text-black/50">가로</span>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={photoOffsetX}
                        onChange={(e) =>
                          updatePhotoTransform({
                            offsetX: Number(e.currentTarget.value),
                          })
                        }
                        className="flex-1"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="w-14 text-[11px] text-black/50">세로</span>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        step={1}
                        value={photoOffsetY}
                        onChange={(e) =>
                          updatePhotoTransform({
                            offsetY: Number(e.currentTarget.value),
                          })
                        }
                        className="flex-1"
                      />
                    </label>
                  </div>
                </div>
                </div>
                </>
              )}
            </div>
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
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
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
    </section>
  );
}

