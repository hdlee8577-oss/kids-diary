import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";
import { siteConfig } from "@/Site.config";

/**
 * 마이그레이션 API
 * photos 테이블에 thumb_pos_x, thumb_pos_y 컬럼 추가
 * 
 * POST /api/migrate
 * Headers: x-admin-token: <ADMIN_TOKEN>
 */
export async function POST(req: Request) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 },
    );
  }

  try {
    // 먼저 컬럼이 있는지 확인
    const { data: testData, error: testError } = await supabase
      .from(siteConfig.data.photos.table)
      .select("thumb_pos_x, thumb_pos_y")
      .limit(1);

    if (testError) {
      // 컬럼이 없으면 에러 발생
      if (
        testError.message.includes("thumb_pos_x") ||
        testError.message.includes("thumb_pos_y") ||
        testError.message.includes("column") ||
        testError.code === "PGRST116"
      ) {
        return NextResponse.json(
          {
            error: "컬럼이 없습니다. Supabase SQL Editor에서 수동으로 실행해주세요.",
            sql: `alter table if exists public.photos
  add column if not exists thumb_pos_x numeric(5, 2) null default 50.0,
  add column if not exists thumb_pos_y numeric(5, 2) null default 50.0;`,
          },
          { status: 400 },
        );
      }
      throw testError;
    }

    // 컬럼이 이미 존재함
    return NextResponse.json({
      success: true,
      message: "컬럼이 이미 존재합니다.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
        sql: `alter table if exists public.photos
  add column if not exists thumb_pos_x numeric(5, 2) null default 50.0,
  add column if not exists thumb_pos_y numeric(5, 2) null default 50.0;`,
      },
      { status: 500 },
    );
  }
}
