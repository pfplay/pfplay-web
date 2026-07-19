import { isIOS, isInAppBrowser } from '@/shared/lib/browser/browser-environment';

/**
 * 설치 안내를 어떤 방식으로 보여줘야 하는지.
 *
 * 브라우저마다 설치 경로가 달라서 하나의 안내로는 커버가 안 된다 (#461).
 * - Android Chromium 은 beforeinstallprompt 로 네이티브 설치창을 띄울 수 있다
 * - iOS Safari 는 설치 API 자체가 없어서 공유 → 홈 화면에 추가를 손으로 눌러야 한다
 * - 인앱 웹뷰는 설치 수단이 없어서 외부 브라우저로 나가야 한다
 */
export type InstallEnvironment =
  /** 이미 홈 화면에서 실행 중 — 안내할 게 없다 */
  | 'installed'
  /** 네이티브 설치창을 띄울 수 있다 */
  | 'prompt'
  /** 수동 설치 단계를 안내한다 */
  | 'ios-guide'
  /** 외부 브라우저로 여는 법을 안내한다 */
  | 'in-app-browser'
  /** 설치 개념이 없거나 지원하지 않는 환경 — 진입점을 숨긴다 */
  | 'unsupported';

type Input = {
  userAgent: string;
  standalone: boolean;
  /** beforeinstallprompt 이벤트를 잡아둔 상태인지 */
  hasInstallPrompt: boolean;
};

export const installEnvironment = ({
  userAgent,
  standalone,
  hasInstallPrompt,
}: Input): InstallEnvironment => {
  if (standalone) return 'installed';

  // 인앱 웹뷰를 iOS 판별보다 먼저 본다 — iOS 카카오톡은 둘 다 참이지만 설치는 불가능하다.
  if (isInAppBrowser(userAgent)) return 'in-app-browser';

  if (hasInstallPrompt) return 'prompt';

  if (isIOS(userAgent)) return 'ios-guide';

  return 'unsupported';
};
