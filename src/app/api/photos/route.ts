import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";
import { extractExifFromBytes } from "@/lib/photos/exif";
import { reverseGeocodeTitle } from "@/lib/photos/reverseGeocode";

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
      thumb_pos_x: r.thumb_pos_x ?? 50,
      thumb_pos_y: r.thumb_pos_y ?? 50,
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
  const baseTitle = (form.get("title")?.toString() || "").trim();
  const overrideTakenAt = (form.get("takenAt")?.toString() || "").trim() || null;
  const metaRaw = (form.get("meta")?.toString() || "").trim();
  const meta: Array<{ title?: string; takenAt?: string }> = (() => {
    if (!metaRaw) return [];
    try {
      const parsed = JSON.parse(metaRaw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as Array<{ title?: string; takenAt?: string }>;
    } catch {
      return [];
    }
  })();
  const files = form.getAll("files");
  const fileSingle = form.get("file");
  const uploadFiles: File[] = [
    ...(files.filter((f): f is File => f instanceof File) as File[]),
    ...(fileSingle instanceof File ? [fileSingle] : []),
  ];

  if (uploadFiles.length === 0) {
    return NextResponse.json({ error: "Missing file(s)" }, { status: 400 });
  }

  const createdIds: string[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  for (let idx = 0; idx < uploadFiles.length; idx++) {
    const file = uploadFiles[idx];
    const ext = (() => {
      const name = file.name || "";
      const i = name.lastIndexOf(".");
      if (i === -1) return "jpg";
      return name.slice(i + 1).toLowerCase() || "jpg";
    })();

    const objectPath = `${siteId}/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const perFile = meta[idx] || {};
    const perFileTakenAt = (perFile.takenAt || "").trim() || null;
    const exif = overrideTakenAt || perFileTakenAt ? {} : await extractExifFromBytes(bytes);
    const takenAt = overrideTakenAt ?? perFileTakenAt ?? exif.takenAt ?? null;

    let title = (perFile.title || "").trim() || baseTitle;
    if (!title) {
      if (exif.gps) {
        const guessed = await reverseGeocodeTitle(exif.gps.lat, exif.gps.lon);
        if (guessed) title = guessed;
      }
      if (!title) {
        title = file.name?.replace(/\.[^/.]+$/, "") || "";
      }
    }

    const upload = await supabase.storage
      .from(siteConfig.data.photos.bucket)
      .upload(objectPath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (upload.error) {
      errors.push({ name: file.name, error: upload.error.message });
      continue;
    }

    const publicUrl = supabase.storage
      .from(siteConfig.data.photos.bucket)
      .getPublicUrl(objectPath)
      .data.publicUrl;

    const insert = await supabase
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

    if (insert.error) {
      errors.push({ name: file.name, error: insert.error.message });
      continue;
    }

    createdIds.push(insert.data.id);
  }

  return NextResponse.json({
    ok: createdIds.length > 0,
    ids: createdIds,
    errors,
  });
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

  const body = (await req.json()) as { ids: string[]; siteId?: string };
  const ids = Array.isArray(body.ids) ? body.ids : [];
  const siteId = (body.siteId || siteConfig.siteId).trim();

  if (ids.length === 0) {
    return NextResponse.json({ error: "Missing ids" }, { status: 400 });
  }

  // Fetch paths for storage delete
  const { data: rows, error: fetchErr } = await supabase
    .from(siteConfig.data.photos.table)
    .select("id, image_path")
    .eq("site_id", siteId)
    .in("id", ids)
    .returns<Array<{ id: string; image_path: string | null }>>();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const paths = (rows ?? [])
    .map((r) => r.image_path)
    .filter((p): p is string => typeof p === "string" && p.length > 0);

  if (paths.length > 0) {
    const storageDel = await supabase.storage
      .from(siteConfig.data.photos.bucket)
      .remove(paths);
    if (storageDel.error) {
      // continue to DB delete even if storage delete fails
    }
  }

  const { error: delErr } = await supabase
    .from(siteConfig.data.photos.table)
    .delete()
    .eq("site_id", siteId)
    .in("id", ids);

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: ids.length });
}

