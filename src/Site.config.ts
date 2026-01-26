export type LayoutMode = "timeline" | "cards";

export type FontChoice = "geist" | "notoSansKr" | "system";

export type ThemeSettings = {
  colors: {
    primary: string; // hex
    background: string; // hex
    surface: string; // hex
    text: string; // hex
  };
  radiusPx: number;
  font: FontChoice;
  layout: {
    mode: LayoutMode;
  };
};

export type SiteProfile = {
  childName: string;
  intro: string;
  birthDate?: string; // ISO date string
};

export type SiteSettings = {
  profile: SiteProfile;
  theme: ThemeSettings;
};

export type SiteConfig = {
  siteId: string;
  profile: SiteProfile;
  defaults: {
    theme: ThemeSettings;
  };
};

export const siteConfig: SiteConfig = {
  // Supabase `site_settings.site_id`로 저장/조회되는 키
  siteId: "default",
  profile: {
    childName: "서아",
    intro:
      "사진과 일기를 차곡차곡 모아두는 공간이에요. 오늘의 한 장면이 내일의 소중한 기억이 되도록, 따뜻하게 기록해요.",
    birthDate: undefined,
  },
  defaults: {
    theme: {
      colors: {
        primary: "#18181B",
        background: "#FFF7ED",
        surface: "#FFFFFF",
        text: "#18181B",
      },
      radiusPx: 24,
      font: "geist",
      layout: {
        mode: "cards",
      },
    },
  },
};

export const defaultSiteSettings: SiteSettings = {
  profile: siteConfig.profile,
  theme: siteConfig.defaults.theme,
};

