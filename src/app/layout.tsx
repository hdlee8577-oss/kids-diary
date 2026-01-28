import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, Nanum_Gothic, Jua } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { siteConfig, type SiteSettings } from "@/Site.config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nanumGothic = Nanum_Gothic({
  variable: "--font-nanum-gothic",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "성장 기록",
  description: "커스터마이징 가능한 성장 기록 프레임워크",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

async function getInitialSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("site_id", siteConfig.siteId)
      .maybeSingle<{ settings: SiteSettings }>();

    if (error || !data) return null;
    return data.settings;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getInitialSettings();

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} ${nanumGothic.variable} ${jua.variable} min-h-dvh antialiased`}
      >
        <ThemeProvider initialSettings={initialSettings}>
          <div className="min-h-dvh">
            <SiteHeader />
            <SettingsSidebar />
            <MobileMenu />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
