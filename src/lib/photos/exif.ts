import exifr from "exifr";

export type ExtractedExif = {
  takenAt?: string; // yyyy-mm-dd
  gps?: { lat: number; lon: number };
};

function toIsoDate(d: unknown): string | undefined {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export async function extractExifFromBytes(
  bytes: Uint8Array,
): Promise<ExtractedExif> {
  try {
    const parsed = (await exifr.parse(bytes, {
      // keep it small + reliable
      tiff: true,
      exif: true,
      gps: true,
      icc: false,
      xmp: false,
    })) as unknown;

    const p = parsed as {
      DateTimeOriginal?: Date;
      CreateDate?: Date;
      ModifyDate?: Date;
      latitude?: number;
      longitude?: number;
    };

    const takenAt =
      toIsoDate(p?.DateTimeOriginal) || toIsoDate(p?.CreateDate) || toIsoDate(p?.ModifyDate);

    const lat = typeof p?.latitude === "number" ? p.latitude : undefined;
    const lon = typeof p?.longitude === "number" ? p.longitude : undefined;

    return {
      takenAt,
      gps:
        typeof lat === "number" && typeof lon === "number"
          ? { lat, lon }
          : undefined,
    };
  } catch {
    return {};
  }
}

