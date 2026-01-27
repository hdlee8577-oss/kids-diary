import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";
import { siteConfig } from "@/Site.config";

type UserMenuSettings = {
  enabled_modules: string[];
  menu_order: string[];
  role_mode: "parent" | "child" | "both";
  age_in_months?: number;
  preset?: string;
};

// GET: 사용자 메뉴 설정 조회
// 현재는 siteId 기반, 나중에 user_id로 변경 가능
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId") || siteConfig.siteId;
  // 나중에 인증 추가 시: const userId = searchParams.get("userId");

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  // 현재는 siteId를 user_id로 사용 (임시)
  // 나중에 인증 추가 시 user_id로 변경
  const { data, error } = await supabase
    .from("user_menu_settings")
    .select("*")
    .eq("user_id", siteId) // 임시: siteId를 user_id로 사용
    .maybeSingle<UserMenuSettings & { id: string; created_at: string; updated_at: string }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 기본값 반환 (설정이 없을 때)
  if (!data) {
    return NextResponse.json({
      settings: {
        enabled_modules: ["photos", "diary"], // 기본 메뉴
        menu_order: [],
        role_mode: "parent",
        preset: "custom",
      },
    });
  }

  return NextResponse.json({
    settings: {
      enabled_modules: data.enabled_modules || [],
      menu_order: data.menu_order || [],
      role_mode: data.role_mode || "parent",
      age_in_months: data.age_in_months,
      preset: data.preset || "custom",
    },
  });
}

// POST: 사용자 메뉴 설정 저장/업데이트
export async function POST(req: Request) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  const body = (await req.json()) as {
    siteId?: string;
    settings: UserMenuSettings;
  };

  const siteId = body.siteId || siteConfig.siteId;
  // 나중에 인증 추가 시: const userId = body.userId;

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  // 현재는 siteId를 user_id로 사용 (임시)
  // 나중에 인증 추가 시 user_id로 변경
  const { error } = await supabase
    .from("user_menu_settings")
    .upsert(
      {
        user_id: siteId, // 임시: siteId를 user_id로 사용
        enabled_modules: body.settings.enabled_modules || [],
        menu_order: body.settings.menu_order || [],
        role_mode: body.settings.role_mode || "parent",
        age_in_months: body.settings.age_in_months,
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
