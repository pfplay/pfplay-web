import { YouTubeConfig } from 'react-player/youtube';

/**
 * 미리보기용 YouTube 플레이어 설정
 * 기존 video.component.tsx의 설정을 미리보기용으로 수정
 */
export const previewPlayerConfig: YouTubeConfig = {
  playerVars: {
    // 컨트롤 표시 (미리보기에서는 사용자가 제어 가능)
    controls: 1,
    // 자동재생 비활성화 (호버 시에만 재생)
    autoplay: 0,
    // YouTube 로고 숨김
    modestbranding: 1,
    // 관련 동영상 숨김
    rel: 0,
    // 컨트롤 자동 숨김
    autohide: 1,
    // 전체화면 비활성화 (미리보기 목적)
    fs: 0,
    // 키보드 컨트롤 비활성화
    disablekb: 1,
    // 정보 표시 비활성화
    iv_load_policy: 3,
    // 기본 음소거 (자동재생 정책 준수)
    mute: 1,
  },
};

/**
 * 미리보기 플레이어 기본 크기
 */
export const PREVIEW_PLAYER_SIZES = {
  sidebar: {
    width: 320,
    height: 180,
  },
  modal: {
    width: 280,
    height: 157,
  },
} as const;
