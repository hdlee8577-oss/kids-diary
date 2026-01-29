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
  thumb_pos_x: number | null;
  thumb_pos_y: number | null;
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
    .select("id, site_id, title, image_url, taken_at, thumb_pos_x, thumb_pos_y, created_at")
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
      thumb_pos_x: r.thumb_pos_x ?? 50.0,
      thumb_pos_y: r.thumb_pos_y ?? 50.0,
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

  return NextResponse.json({ ok: true, id: data.id, imageUrl: publicUrl });
}

export async function DELETE(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const idsStr = searchParams.get("ids");
  if (!idsStr) {
    return NextResponse.json({ error: "Missing ids" }, { status: 400 });
  }

  const ids = idsStr.split(",").filter(Boolean);
  if (ids.length === 0) {
    return NextResponse.json({ error: "Empty ids" }, { status: 400 });
  }

  // 먼저 이미지 경로 조회
  const { data: photos, error: fetchError } = await supabase
    .from(siteConfig.data.photos.table)
    .select("image_path")
    .in("id", ids);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Storage에서 이미지 삭제
  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.image_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from(siteConfig.data.photos.bucket).remove(paths);
    }
  }

  // DB에서 레코드 삭제
  const { error } = await supabase
    .from(siteConfig.data.photos.table)
    .delete()
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
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

  const body = await req.json().catch(() => ({}));
  const { id, thumbPosX, thumbPosY } = body as {
    id?: string;
    thumbPosX?: number;
    thumbPosY?: number;
  };

  if (!id || thumbPosX === undefined || thumbPosY === undefined) {
    return NextResponse.json(
      { error: "Missing id, thumbPosX, or thumbPosY" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from(siteConfig.data.photos.table)
    .update({
      thumb_pos_x: thumbPosX,
      thumb_pos_y: thumbPosY,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

