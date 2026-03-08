import type { Music } from '@/shared/api/http/types/playlists';
import type { PlaylistTrack } from '@/shared/api/http/types/playlists';
import type { PreviewTrack } from '../model/preview.model';

/**
 * 플레이리스트 트랙을 미리보기 트랙으로 변환
 */
export const convertPlaylistTrackToPreview = (track: PlaylistTrack): PreviewTrack => ({
  id: track.linkId,
  title: track.name,
  thumbnailUrl: track.thumbnailImage,
  videoUrl: `https://www.youtube.com/watch?v=${track.linkId}`,
  source: 'playlist-track',
});

/**
 * 검색 결과 음악을 미리보기 트랙으로 변환
 */
export const convertSearchMusicToPreview = (music: Music): PreviewTrack => ({
  id: music.videoId,
  title: music.videoTitle,
  thumbnailUrl: music.thumbnailUrl,
  videoUrl: `https://www.youtube.com/watch?v=${music.videoId}`,
  source: 'search-result',
});

/**
 * YouTube 비디오 ID를 URL에서 추출
 */
export const extractVideoIdFromUrl = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] || null;
};

/**
 * 트랙 제목을 안전하게 디코딩 (기존 safeDecodeURI 활용 가능)
 */
export const safeDecodeTitle = (title: string): string => {
  try {
    return decodeURIComponent(title);
  } catch {
    return title;
  }
};
