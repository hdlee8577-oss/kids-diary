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

  let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  // 현재는 siteId를 user_id로 사용 (임시)
  // 나중에 인증 추가 시 user_id로 변경
  const { data, error } = await supabaseAdmin
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
    siteId?: string;
    settings: UserMenuSettings;
  };

  const siteId = body.siteId || siteConfig.siteId;
  // 나중에 인증 추가 시: const userId = body.userId;

  let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 }
    );
  }

  // 현재는 siteId를 user_id로 사용 (임시)
  // 나중에 인증 추가 시 user_id로 변경
  // camelCase를 snake_case로 변환하여 DB에 저장
  const { error } = await supabaseAdmin
    .from("user_menu_settings")
    .upsert(
      {
        user_id: siteId, // 임시: siteId를 user_id로 사용
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
