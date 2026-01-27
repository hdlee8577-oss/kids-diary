import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";
import { siteConfig } from "@/Site.config";

// DB 스키마용 타입 (snake_case)
type UserMenuSettingsDB = {
  enabled_modules: string[];
  menu_order: string[];
  role_mode: "parent" | "child" | "both";
  age_in_months?: number;
  preset?: string;
};

// API 요청/응답용 타입 (camelCase)
type UserMenuSettingsAPI = {
  enabledModules: string[];
  menuOrder: string[];
  roleMode: "parent" | "child" | "both";
  ageInMonths?: number;
  preset?: string;
};

// GET: 사용자 메뉴 설정 조회
// userId 기반으로 조회 (없으면 siteConfig.siteId로 폴백)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId =
    searchParams.get("userId") ||
    searchParams.get("siteId") || // 이전 버전과의 호환용
    siteConfig.siteId;

  let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("user_menu_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserMenuSettingsDB & { id: string; created_at: string; updated_at: string }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 기본값 반환 (설정이 없을 때)
  if (!data) {
    return NextResponse.json({
      settings: {
        enabledModules: ["photos", "diary"], // 기본 메뉴
        menuOrder: [],
        roleMode: "parent",
        preset: "custom",
      },
    });
  }

  // snake_case를 camelCase로 변환
  return NextResponse.json({
    settings: {
      enabledModules: data.enabled_modules || [],
      menuOrder: data.menu_order || [],
      roleMode: data.role_mode || "parent",
      ageInMonths: data.age_in_months,
      preset: data.preset || "custom",
    },
  });
}

// POST: 사용자 메뉴 설정 저장/업데이트
export async function POST(req: Request) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  const body = (await req.json()) as {
    userId?: string;
    siteId?: string; // 이전 버전과의 호환용
    settings: UserMenuSettingsAPI;
  };

  const userId = body.userId || body.siteId || siteConfig.siteId;

  let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  // camelCase를 snake_case로 변환하여 DB에 저장
  const { error } = await supabaseAdmin
    .from("user_menu_settings")
    .upsert(
      {
        user_id: userId,
        enabled_modules: body.settings.enabledModules || [],
        menu_order: body.settings.menuOrder || [],
        role_mode: body.settings.roleMode || "parent",
        age_in_months: body.settings.ageInMonths,
        preset: body.settings.preset || "custom",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
