import { create } from "zustand";
import { siteConfig, type ThemeSettings } from "@/Site.config";

export type SiteSettingsState = {
  theme: ThemeSettings;
  isHydrated: boolean;
  setTheme: (partial: Partial<ThemeSettings>) => void;
  replaceTheme: (theme: ThemeSettings) => void;
  hydrateFromRemote: (theme: ThemeSettings | null) => void;
};

function mergeTheme(current: ThemeSettings, partial: Partial<ThemeSettings>) {
  return {
    ...current,
    ...partial,
    colors: {
      ...current.colors,
      ...(partial.colors ?? {}),
    },
    layout: {
      ...current.layout,
      ...(partial.layout ?? {}),
    },
  };
}

export const useSiteSettingsStore = create<SiteSettingsState>((set) => ({
  theme: siteConfig.defaults.theme,
  isHydrated: false,
  setTheme: (partial) =>
    set((s) => ({
      theme: mergeTheme(s.theme, partial),
    })),
  replaceTheme: (theme) => set({ theme }),
  hydrateFromRemote: (theme) =>
    set({
      theme: theme ?? siteConfig.defaults.theme,
      isHydrated: true,
    }),
}));

