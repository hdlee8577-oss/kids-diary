export type LayoutMode = "timeline" | "cards";
export type ThumbnailSize = "sm" | "md" | "lg";

export type FontChoice = "geist" | "notoSansKr" | "system";

export type CutePresetId = "warmBear" | "rainbowBunny" | "mintDino" | "starlitCat";
export type MascotId = "bear" | "bunny" | "dino" | "cat";
export type BackgroundPattern = "none" | "dots" | "stars" | "clouds";

export type ThemeSettings = {
  colors: {
    primary: string; // hex
    background: string; // hex
    surface: string; // hex
    text: string; // hex
  };
  accents: {
    a: string; // hex
    b: string; // hex
  };
  radiusPx: number;
  font: FontChoice;
  layout: {
    mode: LayoutMode;
  };
  gallery: {
    thumbnailSize: ThumbnailSize;
  };
  cute: {
    presetId: CutePresetId;
    mascot: MascotId;
    pattern: BackgroundPattern;
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
  data: {
    photos: {
      table: string;
      bucket: string;
    };
    diary: {
      table: string;
    };
  };
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
  // 기존 “갤러리/일기 데이터 프로젝트”에 맞게 여기만 바꾸면 연결됩니다.
  data: {
    photos: {
      table: "photos",
      bucket: "photos",
    },
    diary: {
      table: "diary_entries",
    },
  },
  defaults: {
    theme: {
      colors: {
        primary: "#18181B",
        background: "#FFF7ED",
        surface: "#FFFFFF",
        text: "#18181B",
      },
      accents: {
        a: "#FDE68A",
        b: "#FDA4AF",
      },
      radiusPx: 24,
      font: "geist",
      layout: {
        mode: "cards",
      },
      gallery: {
        thumbnailSize: "md",
      },
      cute: {
        presetId: "warmBear",
        mascot: "bear",
        pattern: "dots",
      },
    },
  },
};

export const defaultSiteSettings: SiteSettings = {
  profile: siteConfig.profile,
  theme: siteConfig.defaults.theme,
};

