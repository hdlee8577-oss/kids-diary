export type LayoutMode = "timeline" | "cards";
export type ThumbnailSize = "small" | "medium" | "large";

export type FontChoice = "geist" | "notoSansKr" | "comicSans" | "nanumGothic" | "jua" | "system";

export type MoodPreset = "warm" | "cool" | "playful" | "calm" | "custom";

export type HomeMood = {
  accentColor1: string; // hex
  accentColor2: string; // hex
  character?: string; // emoji or character identifier
  preset?: MoodPreset;
};

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
    thumbnailSize?: ThumbnailSize;
  };
  homeMood?: HomeMood;
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
    // 기본 이름은 실제 아이 이름이 아니라 '우리아이'로 노출
    childName: "우리아이",
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
    artworks: {
      table: "artworks",
      bucket: "artworks",
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
      radiusPx: 24,
      font: "geist",
      layout: {
        mode: "cards",
        thumbnailSize: "medium",
      },
      homeMood: {
        accentColor1: "#FECDD3", // rose-200
        accentColor2: "#FDE68A", // amber-200
        character: "🌸",
        preset: "warm",
      },
    },
  },
};

export const defaultSiteSettings: SiteSettings = {
  profile: siteConfig.profile,
  theme: siteConfig.defaults.theme,
};

