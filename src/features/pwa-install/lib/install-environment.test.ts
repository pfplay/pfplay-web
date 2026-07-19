import { installEnvironment } from './install-environment';

const IOS_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Safari';
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; SM-S911N) Chrome/120.0.0.0 Mobile Safari';
const IOS_KAKAO = `${IOS_SAFARI} KAKAOTALK 10.4.0`;
const ANDROID_KAKAO = 'Mozilla/5.0 (Linux; Android 14; wv) Chrome/120 KAKAOTALK/10.4.0';
const INSTAGRAM = `${IOS_SAFARI} Instagram 300.0.0`;
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36';

const env = (userAgent: string, over: Partial<Parameters<typeof installEnvironment>[0]> = {}) =>
  installEnvironment({ userAgent, standalone: false, hasInstallPrompt: false, ...over });

describe('installEnvironment', () => {
  test('이미 설치돼 standalone 이면 어떤 브라우저든 installed', () => {
    [IOS_SAFARI, ANDROID_CHROME, DESKTOP].forEach((ua) => {
      expect(env(ua, { standalone: true })).toBe('installed');
    });
  });

  test('설치 프롬프트를 잡아둔 Android 는 prompt', () => {
    expect(env(ANDROID_CHROME, { hasInstallPrompt: true })).toBe('prompt');
  });

  test('iOS Safari 는 설치 API 가 없으므로 ios-guide', () => {
    expect(env(IOS_SAFARI)).toBe('ios-guide');
  });

  test('인앱 웹뷰는 in-app-browser', () => {
    [IOS_KAKAO, ANDROID_KAKAO, INSTAGRAM].forEach((ua) => {
      expect(env(ua)).toBe('in-app-browser');
    });
  });

  test('iOS 카카오톡은 iOS 지만 설치가 불가능하므로 in-app-browser 가 우선한다', () => {
    expect(env(IOS_KAKAO)).toBe('in-app-browser');
    expect(env(IOS_KAKAO)).not.toBe('ios-guide');
  });

  test('인앱 웹뷰는 설치 프롬프트가 있다고 주장해도 in-app-browser', () => {
    expect(env(ANDROID_KAKAO, { hasInstallPrompt: true })).toBe('in-app-browser');
  });

  test('프롬프트를 못 잡은 Android·데스크톱은 unsupported (진입점 숨김)', () => {
    expect(env(ANDROID_CHROME)).toBe('unsupported');
    expect(env(DESKTOP)).toBe('unsupported');
  });

  test('설치 완료가 다른 모든 판정보다 우선한다', () => {
    expect(env(IOS_KAKAO, { standalone: true })).toBe('installed');
  });
});
