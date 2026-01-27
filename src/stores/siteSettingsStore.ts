import { create } from "zustand";
import {
  defaultSiteSettings,
  type SiteProfile,
  type ThemeSettings,
} from "@/Site.config";

export type ThemeSettingsPatch = Omit<Partial<ThemeSettings>, "colors" | "layout"> & {
  colors?: Partial<ThemeSettings["colors"]>;
  accents?: Partial<ThemeSettings["accents"]>;
  layout?: Partial<ThemeSettings["layout"]>;
  gallery?: Partial<ThemeSettings["gallery"]>;
  cute?: Partial<ThemeSettings["cute"]>;
};

export type SiteProfilePatch = Partial<SiteProfile>;

export type SiteSettingsState = {
  profile: SiteProfile;
  theme: ThemeSettings;
  isHydrated: boolean;
  setTheme: (partial: ThemeSettingsPatch) => void;
  setProfile: (partial: SiteProfilePatch) => void;
  replaceTheme: (theme: ThemeSettings) => void;
  hydrateFromRemote: (settings: { profile?: SiteProfile; theme?: ThemeSettings } | null) => void;
};

function mergeTheme(current: ThemeSettings, partial: ThemeSettingsPatch) {
  return {
    ...current,
    ...partial,
    colors: {
      ...current.colors,
      ...(partial.colors ?? {}),
    },
    accents: {
      ...current.accents,
      ...(partial.accents ?? {}),
    },
    layout: {
      ...current.layout,
      ...(partial.layout ?? {}),
    },
    gallery: {
      ...current.gallery,
      ...(partial.gallery ?? {}),
    },
    cute: {
      ...current.cute,
      ...(partial.cute ?? {}),
    },
  };
}

function mergeThemeWithDefaults(partial?: ThemeSettings) {
  return mergeTheme(defaultSiteSettings.theme, partial ?? {});
}

export const useSiteSettingsStore = create<SiteSettingsState>((set) => ({
  profile: defaultSiteSettings.profile,
  theme: defaultSiteSettings.theme,
  isHydrated: false,
  setTheme: (partial) =>
    set((s) => ({
      theme: mergeTheme(s.theme, partial),
    })),
  setProfile: (partial) =>
    set((s) => ({
      profile: { ...s.profile, ...partial },
    })),
  replaceTheme: (theme) => set({ theme }),
  hydrateFromRemote: (settings) =>
    set({
      profile: settings?.profile ?? defaultSiteSettings.profile,
      theme: mergeThemeWithDefaults(settings?.theme),
      isHydrated: true,
    }),
}));

