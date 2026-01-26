import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

type DiaryRow = {
  id: string;
  site_id: string;
  title: string;
  content: string;
  entry_date: string;
  created_at: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId") || siteConfig.siteId;

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ items: [], persistence: "disabled" });
  }

  const { data, error } = await supabase
    .from(siteConfig.data.diary.table)
    .select("id, site_id, title, content, entry_date, created_at")
    .eq("site_id", siteId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<DiaryRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items =
    data?.map((r) => ({
      id: r.id,
      title: r.title ?? "",
      content: r.content ?? "",
      entry_date: r.entry_date,
      created_at: r.created_at,
    })) ?? [];

  return NextResponse.json({ items });
}

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

  const body = (await req.json()) as {
    siteId?: string;
    title?: string;
    content: string;
    entryDate?: string; // yyyy-mm-dd
  };

  const siteId = (body.siteId || siteConfig.siteId).trim();
  const title = (body.title || "").trim();
  const content = (body.content || "").trim();
  const entryDate = (body.entryDate || "").trim() || null;

  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(siteConfig.data.diary.table)
    .insert({
      site_id: siteId,
      title,
      content,
      entry_date: entryDate,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

