"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";
import { MENU_PRESETS } from "@/config/menuPresets";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import Link from "next/link";

export default function MenuSettingsPage() {
  const router = useRouter();
  const {
    enabledModules,
    menuOrder,
    roleMode,
    ageInMonths,
    preset,
    loading,
    updateSettings,
  } = useUserMenuSettings();

  const [selectedPreset, setSelectedPreset] = useState(preset || "custom");
  const [selectedModules, setSelectedModules] = useState<string[]>(enabledModules);
  const [selectedAgeInMonths, setSelectedAgeInMonths] = useState<number | undefined>(ageInMonths);
  const [selectedRoleMode, setSelectedRoleMode] = useState<"parent" | "child" | "both">(roleMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setSelectedModules(enabledModules);
      setSelectedPreset(preset || "custom");
      setSelectedAgeInMonths(ageInMonths);
      setSelectedRoleMode(roleMode);
    }
  }, [loading, enabledModules, preset, ageInMonths, roleMode]);

  // 프리셋 적용
  function applyPreset(presetId: string) {
    const preset = MENU_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setSelectedModules(preset.enabledModules);
    setSelectedRoleMode(preset.roleMode);
  }

  // 나이 입력 시 자동 추천
  function handleAgeChange(months: number) {
    setSelectedAgeInMonths(months);
    const recommended = MENU_PRESETS.find(
      (p) => months >= p.ageRange.min && months <= p.ageRange.max
    );
    if (recommended && recommended.id !== "custom") {
      setSelectedPreset(recommended.id);
      setSelectedModules(recommended.enabledModules);
      setSelectedRoleMode(recommended.roleMode);
    }
  }

  // 저장
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        enabledModules: selectedModules,
        menuOrder: menuOrder,
        preset: selectedPreset,
        roleMode: selectedRoleMode,
        ageInMonths: selectedAgeInMonths,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  // 카테고리별 그룹화
  const modulesByCategory = MENU_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof MENU_MODULES>);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <p className="text-sm text-black/60">불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
        >
          ← 홈으로
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-2">메뉴 설정</h1>
      <p className="text-sm text-black/60 mb-8">
        아이의 나이와 필요에 맞게 메뉴를 선택해요
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 나이 입력 */}
      <section className="mb-8 p-4 rounded-lg border border-black/10 bg-[var(--color-surface)]/70">
        <Field label="아이 나이 (월)">
          <Input
            type="number"
            value={selectedAgeInMonths || ""}
            onChange={(e) => {
              const months = parseInt(e.currentTarget.value) || undefined;
              if (months !== undefined) {
                handleAgeChange(months);
              } else {
                setSelectedAgeInMonths(undefined);
              }
            }}
            placeholder="예: 36 (3세)"
            min="0"
            max="216"
          />
          {selectedAgeInMonths !== undefined && (
            <p className="mt-1 text-xs text-black/50">
              {Math.floor(selectedAgeInMonths / 12)}세 {selectedAgeInMonths % 12}개월
            </p>
          )}
        </Field>
      </section>

      {/* 프리셋 선택 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">빠른 설정</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MENU_PRESETS.filter((p) => p.id !== "custom").map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`p-4 rounded-lg border-2 text-left transition ${
                selectedPreset === p.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-black/10 hover:border-[var(--color-primary)]/30"
              }`}
            >
              <h3 className="font-semibold mb-1">{p.label}</h3>
              <p className="text-xs text-black/60">{p.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 직접 선택 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">메뉴 직접 선택</h2>

        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold mb-3 capitalize">
              {category === "basic" && "기본"}
              {category === "growth" && "성장 기록"}
              {category === "portfolio" && "작품/활동"}
              {category === "health" && "건강"}
              {category === "social" && "소셜"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modules.map((module) => {
                const isEnabled = selectedModules.includes(module.id);
                return (
                  <label
                    key={module.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      isEnabled
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, module.id]);
                        } else {
                          setSelectedModules(selectedModules.filter((id) => id !== module.id));
                        }
                      }}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{module.icon}</span>
                        <span className="font-medium text-sm">{module.label}</span>
                      </div>
                      <p className="text-xs text-black/60 mt-1">{module.description}</p>
                      {module.ageRange && (
                        <p className="text-xs text-black/40 mt-1">
                          권장: {module.ageRange.min ? `${Math.floor(module.ageRange.min / 12)}세 이상` : ""}
                          {module.ageRange.max ? ` ~ ${Math.floor(module.ageRange.max / 12)}세` : ""}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* 역할 모드 */}
      <section className="mb-8">
        <Field label="역할 모드">
          <div className="grid grid-cols-3 gap-2">
            {(["parent", "child", "both"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                variant={selectedRoleMode === mode ? "primary" : "secondary"}
                onClick={() => setSelectedRoleMode(mode)}
              >
                {mode === "parent" && "부모용"}
                {mode === "child" && "아이용"}
                {mode === "both" && "둘 다"}
              </Button>
            ))}
          </div>
        </Field>
      </section>

      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            setSelectedModules(enabledModules);
            setSelectedPreset(preset || "custom");
            setSelectedAgeInMonths(ageInMonths);
            setSelectedRoleMode(roleMode);
          }}
          disabled={saving}
        >
          취소
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </main>
  );
}
