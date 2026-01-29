import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const body = (await req.json()) as {
    title?: string;
    content?: string;
    entryDate?: string;
    photos?: string[];
  };

  const updateData: Record<string, any> = {};
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.content !== undefined) updateData.content = body.content.trim();
  if (body.entryDate !== undefined) updateData.entry_date = body.entryDate || null;
  if (body.photos !== undefined) updateData.photos = body.photos.slice(0, 4); // max 4

  const { error } = await supabase
    .from(siteConfig.data.diary.table)
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  const { error } = await supabase
    .from(siteConfig.data.diary.table)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
