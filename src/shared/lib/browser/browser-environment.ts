/**
 * 브라우저 환경 판별 원시 함수들.
 *
 * push-notification 과 pwa-install 두 feature 가 같은 판별을 필요로 해서 shared 로 올렸다.
 * 전부 SSR-safe 여야 한다 — 서버 렌더 중에도 호출된다.
 */

export const isIOS = (ua: string): boolean => /iPhone|iPad|iPod/i.test(ua);

/** PWA standalone(홈화면 추가) 모드 여부. (SSR-safe) */
export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

/**
 * 카카오톡·인스타그램 등 앱 안에 내장된 웹뷰인지.
 *
 * 이 웹뷰들은 홈 화면 추가 자체를 제공하지 않아서, 안내를 아무리 잘 해도 설치가 불가능하다.
 * 외부 브라우저로 여는 길을 알려주는 것 말고는 방법이 없다.
 */
export const isInAppBrowser = (ua: string): boolean =>
  /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps|everytimeApp|wv\)/i.test(ua);

export type AndroidBrowser = 'samsung' | 'firefox' | 'chrome' | 'other';

/**
 * 수동 설치 안내를 브라우저별 메뉴 경로에 맞추기 위한 판별.
 *
 * SamsungBrowser·Firefox UA 에도 'Chrome' 토큰이 섞여 있어 순서가 중요하다 —
 * 더 구체적인 브라우저를 먼저 걸러야 한다.
 */
export const androidBrowser = (ua: string): AndroidBrowser => {
  if (/SamsungBrowser/i.test(ua)) return 'samsung';
  if (/Firefox|FxiOS/i.test(ua)) return 'firefox';
  if (/Chrome/i.test(ua)) return 'chrome';
  return 'other';
};
