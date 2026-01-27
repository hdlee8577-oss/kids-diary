import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

async function getIdFromContext(context: unknown): Promise<string | null> {
  const params = (context as { params?: unknown })?.params;
  if (!params) return null;
  const resolved = (await Promise.resolve(params)) as unknown;
  const id = (resolved as { id?: unknown } | null)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function GET(_req: Request, context: unknown) {
  const id = await getIdFromContext(context);
  if (!id) return NextResponse.json({ item: null }, { status: 400 });

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ item: null, persistence: "disabled" });
  }

  const { data, error } = await supabase
    .from(siteConfig.data.diary.table)
    .select("id, site_id, title, content, entry_date, created_at")
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

  const id = await getIdFromContext(context);
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
    title?: string;
    content?: string;
    entryDate?: string;
  };

  const siteId = (body.siteId || siteConfig.siteId).trim();
  const patch: Record<string, unknown> = {};

  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.content === "string") patch.content = body.content.trim();
  if (typeof body.entryDate === "string" && body.entryDate.trim()) {
    patch.entry_date = body.entryDate.trim();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(siteConfig.data.diary.table)
    .update(patch)
    .eq("id", id)
    .eq("site_id", siteId)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

export async function DELETE(req: Request, context: unknown) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  const id = await getIdFromContext(context);
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

  const { searchParams } = new URL(req.url);
  const siteId = (searchParams.get("siteId") || siteConfig.siteId).trim();

  const { error } = await supabase
    .from(siteConfig.data.diary.table)
    .delete()
    .eq("id", id)
    .eq("site_id", siteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}

