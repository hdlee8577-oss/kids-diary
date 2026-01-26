import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

type PhotoRow = {
  id: string;
  site_id: string;
  title: string;
  image_url: string;
  taken_at: string | null;
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
    .from(siteConfig.data.photos.table)
    .select("id, site_id, title, image_url, taken_at, created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<PhotoRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items =
    data?.map((r) => ({
      id: r.id,
      title: r.title ?? "",
      image_url: r.image_url ?? "",
      taken_at: r.taken_at,
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

  const form = await req.formData();
  const siteId = (form.get("siteId")?.toString() || siteConfig.siteId).trim();
  const title = (form.get("title")?.toString() || "").trim();
  const takenAt = (form.get("takenAt")?.toString() || "").trim() || null;
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = (() => {
    const name = file.name || "";
    const i = name.lastIndexOf(".");
    if (i === -1) return "jpg";
    return name.slice(i + 1).toLowerCase() || "jpg";
  })();

  const objectPath = `${siteId}/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const upload = await supabase.storage
    .from(siteConfig.data.photos.bucket)
    .upload(objectPath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const publicUrl = supabase.storage
    .from(siteConfig.data.photos.bucket)
    .getPublicUrl(objectPath)
    .data.publicUrl;

  const { data, error } = await supabase
    .from(siteConfig.data.photos.table)
    .insert({
      site_id: siteId,
      title,
      image_path: objectPath,
      image_url: publicUrl,
      taken_at: takenAt,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

