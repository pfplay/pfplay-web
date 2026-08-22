import { hasInstallPrompt, showInstallPrompt, subscribeInstallPrompt } from './install-prompt';

/** beforeinstallprompt 를 흉내낸다. jsdom 에는 이 이벤트가 없다. */
const fireBeforeInstallPrompt = (outcome: 'accepted' | 'dismissed' = 'accepted') => {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  window.dispatchEvent(event);
  return event;
};

beforeEach(async () => {
  // 앞 테스트가 남긴 이벤트를 비운다.
  window.dispatchEvent(new Event('appinstalled'));
});

describe('install-prompt', () => {
  test('이벤트가 오기 전에는 띄울 프롬프트가 없다', () => {
    expect(hasInstallPrompt()).toBe(false);
  });

  test('beforeinstallprompt 를 잡아두면 사용 가능해진다', () => {
    fireBeforeInstallPrompt();
    expect(hasInstallPrompt()).toBe(true);
  });

  test('사용자가 설치를 수락하면 true', async () => {
    fireBeforeInstallPrompt('accepted');
    await expect(showInstallPrompt()).resolves.toBe(true);
  });

  test('사용자가 설치를 거절하면 false', async () => {
    fireBeforeInstallPrompt('dismissed');
    await expect(showInstallPrompt()).resolves.toBe(false);
  });

  test('프롬프트는 1회용이다 — 한 번 띄우면 다시 못 쓴다', async () => {
    const event = fireBeforeInstallPrompt();

    await showInstallPrompt();
    expect(hasInstallPrompt()).toBe(false);

    await expect(showInstallPrompt()).resolves.toBe(false);
    // 브라우저가 거부하므로 두 번째는 아예 호출하지 않는다.
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  test('잡아둔 프롬프트가 없으면 아무 일도 없이 false', async () => {
    await expect(showInstallPrompt()).resolves.toBe(false);
  });

  test('설치가 끝나면(appinstalled) 프롬프트를 버린다', () => {
    fireBeforeInstallPrompt();
    window.dispatchEvent(new Event('appinstalled'));
    expect(hasInstallPrompt()).toBe(false);
  });

  test('상태가 바뀌면 구독자에게 알린다', async () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeInstallPrompt(onChange);

    fireBeforeInstallPrompt();
    expect(onChange).toHaveBeenCalledTimes(1);

    await showInstallPrompt();
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    fireBeforeInstallPrompt();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
