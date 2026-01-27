import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig, type SiteSettings } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

type Row = {
  site_id: string;
  settings: SiteSettings;
  updated_at: string;
};

// GET: 로그인된 사용자별로 사이트 설정 조회 (userId 없으면 default 사용)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId =
    searchParams.get("userId") ||
    searchParams.get("siteId") || // 이전 버전과의 호환
    siteConfig.siteId;

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ settings: null, persistence: "disabled" });
  }
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_id, settings, updated_at")
    .eq("site_id", userId)
    .maybeSingle<Row>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data?.settings ?? null });
}

// POST: 로그인된 사용자별 사이트 설정 저장/업데이트
export async function POST(req: Request) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  const body = (await req.json()) as {
    userId?: string;
    siteId?: string; // 이전 버전과의 호환
    settings: SiteSettings;
  };

  const userId = body.userId || body.siteId || siteConfig.siteId;
  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 },
    );
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      site_id: userId,
      settings: body.settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "site_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

