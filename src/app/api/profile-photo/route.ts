import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/Site.config";
import { requireAdminToken } from "@/lib/admin/requireAdminToken";

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

  const objectPath = `profiles/${siteId}/profile.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  // 기존 프로필 사진 삭제 (있다면)
  try {
    const { data: existingFiles } = await supabase.storage
      .from("photos")
      .list(`profiles/${siteId}/`);
    
    if (existingFiles && existingFiles.length > 0) {
      const pathsToDelete = existingFiles.map((f) => `profiles/${siteId}/${f.name}`);
      await supabase.storage.from("photos").remove(pathsToDelete);
    }
  } catch {
    // 기존 파일이 없으면 무시
  }

  const upload = await supabase.storage
    .from("photos")
    .upload(objectPath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const publicUrl = supabase.storage
    .from("photos")
    .getPublicUrl(objectPath)
    .data.publicUrl;

  return NextResponse.json({ photoUrl: publicUrl });
}
