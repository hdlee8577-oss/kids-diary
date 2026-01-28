"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, BookOpen, Palette, Award, Book, Activity, TrendingUp, Calendar, BarChart, Share2, Baby } from "lucide-react";
import { useUserMenuSettings } from "@/hooks/useUserMenuSettings";
import { MENU_MODULES } from "@/config/menuModules";
import type { User } from "@supabase/supabase-js";

// 아이콘 매핑
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  photos: Camera,
  diary: BookOpen,
  artworks: Palette,
  awards: Award,
  books: Book,
  activities: Activity,
  growth: TrendingUp,
  timeline: Calendar,
  stats: BarChart,
  shared: Share2,
  "kids-view": Baby,
};

type DynamicNavProps = {
  toggleSettings?: () => void;
  user?: User | null;
  onLogout?: () => void;
};

export function DynamicNav({ toggleSettings, user, onLogout }: DynamicNavProps = {}) {
  const pathname = usePathname();
  const { enabledModules, menuOrder, loading, error } = useUserMenuSettings();

  // 기본 메뉴 데이터 준비
  const getMenuData = () => {
    if (error) {
      return [
        { id: "photos", path: "/photos", icon: "📸", label: "사진첩", description: "사진첩" },
        { id: "diary", path: "/diary", icon: "📝", label: "일기장", description: "일기장" },
      ];
    }

    if (loading) {
      return [];
    }

    const activeModules = MENU_MODULES.filter((module) =>
      enabledModules.includes(module.id)
    );

    return [...activeModules].sort((a, b) => {
      const aIndex = menuOrder.indexOf(a.id);
      const bIndex = menuOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.order - b.order;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const sortedModules = getMenuData();

  return (
    <>
      {/* 데스크톱: 가로 메뉴 */}
      <nav aria-label="주요 메뉴" className="hidden sm:block">
        <ul className="flex flex-nowrap items-center gap-1">
          {loading ? (
            <li>
              <div className="rounded-[var(--radius)] px-3 py-2 text-sm text-black/50">
                로딩 중...
              </div>
            </li>
          ) : (
            sortedModules.map((module, index) => {
              const isActive = pathname.startsWith(module.path);
              const Icon = ICON_MAP[module.id];
              
              return (
                <motion.li 
                  key={module.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link href={module.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary shadow-lg shadow-primary/20"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      title={module.description}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {module.label}
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })
          )}
        </ul>
      </nav>
    </>
  );
}
