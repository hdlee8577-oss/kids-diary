import { NextResponse } from "next/server";
import { reverseGeocodeTitle } from "@/lib/photos/reverseGeocode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ title: null }, { status: 400 });
  }

  const title = await reverseGeocodeTitle(lat, lon);
  return NextResponse.json({ title });
}

