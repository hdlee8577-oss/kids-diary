"use client";

import { siteConfig, type FontChoice, type LayoutMode } from "@/Site.config";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";
import { useThemeUI } from "@/theme/ThemeProvider";
import { Button } from "@/components/shared/Button";
import { Field } from "@/components/shared/Field";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Sidebar } from "@/components/shared/Sidebar";
import { Textarea } from "@/components/shared/Textarea";

const FONT_OPTIONS: Array<{ value: FontChoice; label: string }> = [
  { value: "geist", label: "Geist" },
  { value: "notoSansKr", label: "Noto Sans KR" },
  { value: "system", label: "System" },
];

const LAYOUT_OPTIONS: Array<{ value: LayoutMode; label: string }> = [
  { value: "cards", label: "카드형" },
  { value: "timeline", label: "타임라인형" },
];

export function SettingsSidebar() {
  const { isSettingsOpen, closeSettings } = useThemeUI();
  const profile = useSiteSettingsStore((s) => s.profile);
  const theme = useSiteSettingsStore((s) => s.theme);
  const setTheme = useSiteSettingsStore((s) => s.setTheme);
  const setProfile = useSiteSettingsStore((s) => s.setProfile);
  const replaceTheme = useSiteSettingsStore((s) => s.replaceTheme);

  return (
    <Sidebar isOpen={isSettingsOpen} title="설정" onClose={closeSettings}>
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

