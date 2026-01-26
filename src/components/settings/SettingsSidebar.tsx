"use client";

import { siteConfig, type FontChoice, type LayoutMode, type ThumbnailSize } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { useThemeUI } from "@/theme/ThemeProvider";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Sidebar } from "@/components/shared/Sidebar";
import { Textarea } from "@/components/shared/Textarea";
import { getAdminToken, setAdminToken } from "@/lib/admin/clientToken";
import { useState } from "react";

const FONT_OPTIONS: Array<{ value: FontChoice; label: string }> = [
  { value: "geist", label: "Geist" },
  { value: "notoSansKr", label: "Noto Sans KR" },
  { value: "system", label: "System" },
];

const LAYOUT_OPTIONS: Array<{ value: LayoutMode; label: string }> = [
  { value: "cards", label: "카드형" },
  { value: "timeline", label: "타임라인형" },
];

const THUMBNAIL_OPTIONS: Array<{ value: ThumbnailSize; label: string }> = [
  { value: "lg", label: "크게" },
  { value: "md", label: "보통" },
  { value: "sm", label: "작게" },
];

export function SettingsSidebar() {
  const { isSettingsOpen, closeSettings } = useThemeUI();
  const profile = useSiteSettingsStore((s) => s.profile);
  const theme = useSiteSettingsStore((s) => s.theme);
  const setTheme = useSiteSettingsStore((s) => s.setTheme);
  const setProfile = useSiteSettingsStore((s) => s.setProfile);
  const replaceTheme = useSiteSettingsStore((s) => s.replaceTheme);

  const [adminToken, setAdminTokenState] = useState(() => getAdminToken());

  return (
    <Sidebar isOpen={isSettingsOpen} title="설정" onClose={closeSettings}>
      <div className="grid gap-3 rounded-[var(--radius)] border border-black/5 bg-white/40 p-4">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Admin (선택)
        </p>
        <Field label="Admin Token" hint="설정/사진/일기 '추가'를 보호해요.">
          <Input
            type="password"
            value={adminToken}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setAdminTokenState(v);
              setAdminToken(v);
            }}
            placeholder="Vercel 환경변수 ADMIN_TOKEN과 동일하게"
          />
        </Field>
        <p className="text-xs text-black/50">
          * 이 값은 브라우저 로컬 저장소에만 저장돼요.
        </p>
      </div>

      <div className="grid gap-4 rounded-[var(--radius)] border border-black/5 bg-white/40 p-4">
        <p className="text-sm font-semibold text-[var(--color-text)]">Profile</p>

        <Field label="아이 이름" hint="메인 화면에 표시돼요.">
          <Input
            value={profile.childName}
            onChange={(e) => setProfile({ childName: e.currentTarget.value })}
            placeholder={siteConfig.profile.childName}
          />
        </Field>

        <Field label="소개글" hint="짧고 따뜻하게 :)">
          <Textarea
            value={profile.intro}
            onChange={(e) => setProfile({ intro: e.currentTarget.value })}
            placeholder={siteConfig.profile.intro}
          />
        </Field>

        <Field label="생년월일 (선택)">
          <Input
            type="date"
            value={profile.birthDate ?? ""}
            onChange={(e) =>
              setProfile({
                birthDate: e.currentTarget.value || undefined,
              })
            }
          />
        </Field>
      </div>

      <div className="grid gap-4 rounded-[var(--radius)] border border-black/5 bg-white/40 p-4">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Theme (실시간)
        </p>

        <Field label="Primary Color">
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={theme.colors.primary}
              onChange={(e) =>
                setTheme({ colors: { primary: e.currentTarget.value } })
              }
              className="h-10 w-14 px-1"
            />
            <Input
              value={theme.colors.primary}
              onChange={(e) =>
                setTheme({ colors: { primary: e.currentTarget.value } })
              }
            />
          </div>
        </Field>

        <Field label="Background">
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={theme.colors.background}
              onChange={(e) =>
                setTheme({ colors: { background: e.currentTarget.value } })
              }
              className="h-10 w-14 px-1"
            />
            <Input
              value={theme.colors.background}
              onChange={(e) =>
                setTheme({ colors: { background: e.currentTarget.value } })
              }
            />
          </div>
        </Field>

        <Field label="Border Radius" hint={`${theme.radiusPx}px`}>
          <input
            type="range"
            min={8}
            max={32}
            value={theme.radiusPx}
            onChange={(e) => setTheme({ radiusPx: Number(e.currentTarget.value) })}
            className="w-full"
          />
        </Field>

        <Field label="Font">
          <Select
            value={theme.font}
            onChange={(e) =>
              setTheme({ font: e.currentTarget.value as FontChoice })
            }
          >
            {FONT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Layout">
          <div className="grid grid-cols-2 gap-2">
            {LAYOUT_OPTIONS.map((o) => {
              const isActive = theme.layout.mode === o.value;
              return (
                <Button
                  key={o.value}
                  type="button"
                  variant={isActive ? "primary" : "secondary"}
                  onClick={() => setTheme({ layout: { mode: o.value as LayoutMode } })}
                >
                  {o.label}
                </Button>
              );
            })}
          </div>
        </Field>

        <Field label="사진 썸네일 크기" hint="사진첩에서 한 화면에 보이는 개수예요.">
          <div className="grid grid-cols-3 gap-2">
            {THUMBNAIL_OPTIONS.map((o) => {
              const isActive = theme.gallery.thumbnailSize === o.value;
              return (
                <Button
                  key={o.value}
                  type="button"
                  size="sm"
                  variant={isActive ? "primary" : "secondary"}
                  onClick={() => setTheme({ gallery: { thumbnailSize: o.value } })}
                >
                  {o.label}
                </Button>
              );
            })}
          </div>
        </Field>

        <Button
          variant="secondary"
          onClick={() => replaceTheme(siteConfig.defaults.theme)}
        >
          기본값으로 리셋
        </Button>
      </div>
    </Sidebar>
  );
}

