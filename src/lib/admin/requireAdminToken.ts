import { NextResponse } from "next/server";

export function requireAdminToken(req: Request) {
  const required = process.env["ADMIN_TOKEN"];
  if (!required) return null; // disabled

  const got = req.headers.get("x-admin-token") || "";
  if (got !== required) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

