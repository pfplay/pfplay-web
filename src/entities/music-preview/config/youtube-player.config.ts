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
 * 미리보기 플레이어 기본 크기.
 *
 * ⚠️ YouTube ToS(Required Minimum Functionality): 임베드 플레이어 viewport ≥200×200 (issue #420).
 * 16:9 에서 높이 200px 는 너비 356px 를 요구하므로 데스크탑 미리듣기는 최소 권장 480×270 사용.
 *
 * `mobile-bottom` 은 PR3 에서 전체너비 16:9 카드로 재설계 예정(112px 바엔 ≥200 불가). 그 전까지
 * 임시로 남겨두며, 컴플라이언스 가드(config.test)는 데스크탑 키만 검사한다.
 */
export const PREVIEW_PLAYER_SIZES = {
  sidebar: {
    width: 480,
    height: 270,
  },
  modal: {
    width: 480,
    height: 270,
  },
  'mobile-bottom': {
    width: 64,
    height: 36,
  },
} as const;
