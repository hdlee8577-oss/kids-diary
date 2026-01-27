import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";
import {
  extractThumbnailFromUrl,
  detectArtworkType,
  type ArtworkType,
} from "@/lib/utils/urlThumbnail";

type ArtworkRow = {
  id: string;
  site_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  url: string | null;
  type: string | null;
  category: string | null;
  grade: string | null;
  tags: string[] | null;
  mom_note: string | null;
  artwork_date: string | null;
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

  console.log("[API Artworks GET] siteId:", siteId, "table:", siteConfig.data.artworks.table);

  const { data, error } = await supabase
    .from(siteConfig.data.artworks.table)
    .select(
      "id, site_id, title, description, image_url, image_path, url, type, category, grade, tags, mom_note, artwork_date, created_at"
    )
    .eq("site_id", siteId)
    .order("artwork_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<ArtworkRow[]>();

  if (error) {
    console.error("[API Artworks GET] Supabase Error:", error);
    console.error("[API Artworks GET] Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      },
      { status: 500 }
    );
  }

  console.log("[API Artworks GET] Found", data?.length || 0, "items for siteId:", siteId);

  const items =
    data?.map((r) => ({
      id: r.id,
      title: r.title ?? "",
      description: r.description ?? "",
      image_url: r.image_url ?? "",
      url: r.url ?? null,
      type: (r.type as ArtworkType) ?? "image",
      category: r.category ?? null,
      grade: r.grade ?? null,
      tags: (r.tags as string[]) ?? [],
      mom_note: r.mom_note ?? null,
      artwork_date: r.artwork_date ?? null,
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
  const description = (form.get("description")?.toString() || "").trim() || null;
  const category = (form.get("category")?.toString() || "").trim() || null;
  const grade = (form.get("grade")?.toString() || "").trim() || null;
  const momNote = (form.get("momNote")?.toString() || "").trim() || null;
  const artworkDate = (form.get("artworkDate")?.toString() || "").trim() || null;
  const url = (form.get("url")?.toString() || "").trim() || null;
  const tagsStr = form.get("tags")?.toString() || "[]";
  let tags: string[] = [];
  try {
    tags = JSON.parse(tagsStr);
  } catch {
    tags = [];
  }

  const file = form.get("file");

  let imagePath: string | null = null;
  let imageUrl: string | null = null;
  let artworkType: ArtworkType = "image";

  // URL 또는 파일 중 하나는 필수
  if (url) {
    // URL에서 썸네일 추출
    const thumbnail = extractThumbnailFromUrl(url);
    if (thumbnail) {
      imageUrl = thumbnail.thumbnailUrl;
      artworkType = thumbnail.type;
      console.log("[artworks POST] URL 썸네일 추출 성공:", {
        originalUrl: url,
        thumbnailUrl: imageUrl,
        type: artworkType,
      });
    } else {
      // 썸네일을 추출할 수 없으면 기본 이미지 또는 빈 값
      imageUrl = null;
      artworkType = detectArtworkType(url);
      console.warn("[artworks POST] URL 썸네일 추출 실패:", url);
    }
  } else if (file instanceof File) {
    // 파일 업로드
    const ext = (() => {
      const name = file.name || "";
      const i = name.lastIndexOf(".");
      if (i === -1) return "jpg";
      return name.slice(i + 1).toLowerCase() || "jpg";
    })();

    imagePath = `${siteId}/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const upload = await supabase.storage
      .from(siteConfig.data.artworks.bucket)
      .upload(imagePath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    imageUrl = supabase.storage
      .from(siteConfig.data.artworks.bucket)
      .getPublicUrl(imagePath)
      .data.publicUrl;
  } else {
    return NextResponse.json(
      { error: "이미지 파일 또는 URL 중 하나는 필수입니다." },
      { status: 400 }
    );
  }

  // artwork_date 컬럼이 있을 수도 있고 없을 수도 있으므로, 조건부로 포함
  const insertData: any = {
    site_id: siteId,
    title,
    description,
    image_path: imagePath,
    image_url: imageUrl,
    url: url,
    type: artworkType,
    category,
    grade,
    tags: tags.length > 0 ? tags : null,
    mom_note: momNote,
  };
  
  // artwork_date가 있으면 추가 (컬럼이 없어도 에러가 나지 않도록)
  if (artworkDate) {
    insertData.artwork_date = artworkDate;
  }

  const { data, error } = await supabase
    .from(siteConfig.data.artworks.table)
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
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
  const { data: artworks, error: fetchError } = await supabase
    .from(siteConfig.data.artworks.table)
    .select("image_path")
    .in("id", ids);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Storage에서 이미지 삭제
  if (artworks && artworks.length > 0) {
    const paths = artworks.map((a) => a.image_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from(siteConfig.data.artworks.bucket).remove(paths);
    }
  }

  // DB에서 레코드 삭제
  const { error } = await supabase
    .from(siteConfig.data.artworks.table)
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
  const {
    id,
    title,
    description,
    category,
    grade,
    artworkDate,
    momNote,
    tags,
    url,
  } = body as {
    id?: string;
    title?: string;
    description?: string;
    category?: string;
    grade?: string;
    artworkDate?: string;
    momNote?: string;
    tags?: string[];
    url?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description || null;
  if (category !== undefined) updateData.category = category || null;
  if (grade !== undefined) updateData.grade = grade || null;
  if (artworkDate !== undefined) updateData.artwork_date = artworkDate || null;
  if (momNote !== undefined) updateData.mom_note = momNote || null;
  if (tags !== undefined) updateData.tags = tags && tags.length > 0 ? tags : null;
  
  // URL이 변경되면 썸네일도 다시 추출
  if (url !== undefined) {
    updateData.url = url || null;
    if (url) {
      const thumbnail = extractThumbnailFromUrl(url);
      if (thumbnail) {
        updateData.image_url = thumbnail.thumbnailUrl;
        updateData.type = thumbnail.type;
      } else {
        updateData.type = detectArtworkType(url);
      }
    }
  }

  const { data, error } = await supabase
    .from(siteConfig.data.artworks.table)
    .update(updateData)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
