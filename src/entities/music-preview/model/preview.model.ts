/**
 * 미리보기 재생 상태
 */
export type PlayState = 'playing' | 'stopped';

/**
 * 미리보기 대상 트랙 정보
 */
export type PreviewTrack = {
  /** 고유 식별자 (videoId 등) */
  id: string;
  /** 트랙 제목 */
  title: string;
  /** 썸네일 URL */
  thumbnailUrl: string;
  /** YouTube 비디오 URL */
  videoUrl: string;
  /** 트랙이 속한 소스 ('playlist-track' | 'search-result') */
  source: 'playlist-track' | 'search-result';
};

/**
 * 미리보기 상태 모델
 */
export type Model = {
  /** 현재 재생중인 트랙 (단일 재생 보장) */
  currentTrack: PreviewTrack | null;

  /** 재생 상태 */
  playState: PlayState;

  /** 플레이어 준비 상태 */
  playerReady: boolean;

  /** Actions */
  startPreview: (track: PreviewTrack) => void;
  stopPreview: () => void;
  setPlayerReady: (ready: boolean) => void;

  /** 특정 트랙이 재생중인지 확인 */
  isTrackPlaying: (trackId: string) => boolean;
};
