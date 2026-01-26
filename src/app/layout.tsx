import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { siteConfig } from "@/Site.config";

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
});

export const metadata: Metadata = {
  title: "성장 기록",
  description: "커스터마이징 가능한 성장 기록 프레임워크",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} min-h-dvh antialiased`}
      >
        <ThemeProvider initialTheme={siteConfig.defaults.theme}>
          <div className="min-h-dvh">
            <SiteHeader />
            <SettingsSidebar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
