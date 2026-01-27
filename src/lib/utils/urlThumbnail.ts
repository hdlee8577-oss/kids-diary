/**
 * URL에서 썸네일 이미지 URL을 추출하는 유틸리티
 */

export type ArtworkType = "image" | "video" | "writing" | "link";

/**
 * YouTube URL에서 video ID 추출
 */
function extractYouTubeVideoId(url: string): string | null {
  // 다양한 YouTube URL 형식 지원
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // https://youtube.com/watch?v=VIDEO_ID&feature=...
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
    // https://m.youtube.com/watch?v=VIDEO_ID
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // https://youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
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
 * maxresdefault가 없을 수 있으므로 hqdefault를 기본으로 사용
 */
function getYouTubeThumbnail(videoId: string): string {
  // hqdefault는 항상 존재하므로 기본값으로 사용
  // 필요시 maxresdefault를 시도하고 실패하면 hqdefault로 fallback 가능
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * YouTube 채널 URL인지 확인
 */
function isYouTubeChannelUrl(url: string): boolean {
  return (
    url.includes("youtube.com/@") ||
    url.includes("youtube.com/channel/") ||
    url.includes("youtube.com/c/") ||
    url.includes("youtube.com/user/")
  );
}

/**
 * URL 타입 감지
 */
export function detectArtworkType(url: string): ArtworkType {
  // YouTube 채널 URL은 링크로 처리 (개별 동영상이 아님)
  if (isYouTubeChannelUrl(url)) {
    return "link";
  }
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
  // YouTube 채널 URL은 썸네일 추출 불가
  if (isYouTubeChannelUrl(url)) {
    return null;
  }

  // YouTube 개별 동영상
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
