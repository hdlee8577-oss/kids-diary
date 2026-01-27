/**
 * URL에서 썸네일 이미지 URL을 추출하는 유틸리티
 */

export type ArtworkType = "image" | "video" | "writing" | "link";

/**
 * YouTube URL에서 video ID 추출
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube video ID로 썸네일 URL 생성
 */
function getYouTubeThumbnail(videoId: string): string {
  // maxresdefault가 없으면 hqdefault 사용
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * URL 타입 감지
 */
export function detectArtworkType(url: string): ArtworkType {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "video";
  }
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return "image";
  }
  return "link";
}

/**
 * URL에서 썸네일 이미지 URL 추출
 */
export function extractThumbnailFromUrl(url: string): {
  thumbnailUrl: string;
  type: ArtworkType;
} | null {
  // YouTube
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    return {
      thumbnailUrl: getYouTubeThumbnail(youtubeId),
      type: "video",
    };
  }

  // 이미지 URL (직접 링크)
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return {
      thumbnailUrl: url,
      type: "image",
    };
  }

  // 기타 링크는 썸네일 없음 (나중에 oEmbed로 확장 가능)
  return null;
}
