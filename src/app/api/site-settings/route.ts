import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig, type ThemeSettings } from "@/Site.config";

type Row = {
  site_id: string;
  theme: ThemeSettings;
  updated_at: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId") || siteConfig.siteId;

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ theme: null, persistence: "disabled" });
  }
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_id, theme, updated_at")
    .eq("site_id", siteId)
    .maybeSingle<Row>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ theme: data?.theme ?? null });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    siteId?: string;
    theme: ThemeSettings;
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
      theme: body.theme,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "site_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

