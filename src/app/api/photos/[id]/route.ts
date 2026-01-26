import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

export async function GET(_req: Request, context: unknown) {
  const id = (context as { params?: { id?: string } })?.params?.id;
  if (!id) return NextResponse.json({ item: null }, { status: 400 });

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ item: null, persistence: "disabled" });
  }

  const { data, error } = await supabase
    .from(siteConfig.data.photos.table)
    .select("id, site_id, title, image_url, image_path, taken_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data ?? null });
}

export async function PATCH(req: Request, context: unknown) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  const id = (context as { params?: { id?: string } })?.params?.id;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Supabase env not configured", persistence: "disabled" },
      { status: 501 },
    );
  }

  const body = (await req.json()) as {
    siteId?: string;
    thumbPosX?: number;
    thumbPosY?: number;
  };
  const siteId = (body.siteId || siteConfig.siteId).trim();
  const x = typeof body.thumbPosX === "number" ? body.thumbPosX : null;
  const y = typeof body.thumbPosY === "number" ? body.thumbPosY : null;

  if (x === null || y === null) {
    return NextResponse.json({ error: "Missing thumbPosX/thumbPosY" }, { status: 400 });
  }

  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const update = await supabase
    .from(siteConfig.data.photos.table)
    .update({ thumb_pos_x: clamp(x), thumb_pos_y: clamp(y) })
    .eq("id", id)
    .eq("site_id", siteId)
    .select("id")
    .single();

  if (update.error) {
    return NextResponse.json({ error: update.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: update.data.id });
}

