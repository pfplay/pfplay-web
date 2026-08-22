import { isIOS, isStandalone } from '@/shared/lib/browser/browser-environment';

// pwa-install feature 와 같은 판별을 쓰므로 shared 로 옮겼다. 기존 import 경로는 유지한다.
export { isIOS, isStandalone };

/**
 * base64url(VAPID 공개키) → Uint8Array.
 * PushManager.subscribe 의 applicationServerKey 는 raw bytes 를 요구한다.
 */
export const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

/** 현재 브라우저가 Web Push 를 지원하는지. (SSR-safe) */
export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** iOS Safari 는 홈화면 추가(standalone) 전에는 Web Push 불가 → 설치 유도 필요. */
export const iosNeedsInstall = (ua: string, standalone: boolean): boolean =>
  isIOS(ua) && !standalone;

/** 앱 Language(소문자 'ko'/'en') → 백엔드 lang enum('KO'/'EN'). */
export const normalizeLang = (l: string): 'KO' | 'EN' =>
  String(l).toUpperCase().startsWith('KO') ? 'KO' : 'EN';
