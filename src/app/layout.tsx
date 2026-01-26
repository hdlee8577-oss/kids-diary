import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "성장 기록",
  description: "우리 가족만의 성장 기록과 사진첩",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-gradient-to-b from-amber-50 via-white to-rose-50 antialiased`}
      >
        <div className="min-h-dvh">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
