/**
 * Android Chromium 의 `beforeinstallprompt` 이벤트를 잡아두는 모듈 단위 저장소.
 *
 * 이 이벤트는 페이지 로드 직후 딱 한 번 발생한다. 사용자가 메뉴를 여는 시점에 리스너를 붙이면
 * 이미 지나가 버려서 설치창을 띄울 수 없다. 그래서 모듈이 로드되는 즉시 리스너를 건다
 * (루트 레이아웃에서 import 하므로 앱 부팅 시점이다).
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferred: BeforeInstallPromptEvent | null = null;
const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // 브라우저 기본 미니 배너를 막고, 우리 진입점에서 원하는 시점에 띄운다.
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export const subscribeInstallPrompt = (onChange: () => void) => {
  subscribers.add(onChange);
  return () => {
    subscribers.delete(onChange);
  };
};

export const hasInstallPrompt = () => deferred !== null;

/** 네이티브 설치창을 띄우고, 사용자가 설치를 수락했는지 반환한다. */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferred) return false;

  // 프롬프트는 1회용이다. 같은 이벤트를 두 번 쓰면 브라우저가 거부한다.
  const event = deferred;
  deferred = null;
  notify();

  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === 'accepted';
};
