import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig, type SiteSettings } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

type Row = {
  site_id: string;
  settings: SiteSettings;
  updated_at: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId") || siteConfig.siteId;

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ settings: null, persistence: "disabled" });
  }
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_id, settings, updated_at")
    .eq("site_id", siteId)
    .maybeSingle<Row>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data?.settings ?? null });
}

export async function POST(req: Request) {
  const auth = requireAdminToken(req);
  if (auth) return auth;

  const body = (await req.json()) as {
    siteId?: string;
    settings: SiteSettings;
  };

  const siteId = body.siteId || siteConfig.siteId;
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
      site_id: siteId,
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

