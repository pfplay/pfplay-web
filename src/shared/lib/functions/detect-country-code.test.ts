import { detectCountryCode } from './detect-country-code';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectCountryCode', () => {
  test('"ko-KR"이면 "KR"을 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'ko-KR' });
    expect(detectCountryCode()).toBe('KR');
  });

  test('"en-US"이면 "US"를 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(detectCountryCode()).toBe('US');
  });

  test('"ja-JP"이면 "JP"를 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'ja-JP' });
    expect(detectCountryCode()).toBe('JP');
  });

  test('"zh-TW"이면 "TW"를 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'zh-TW' });
    expect(detectCountryCode()).toBe('TW');
  });

  test('국가 코드 없이 언어만 있으면 null을 반환한다 ("ko")', () => {
    vi.stubGlobal('navigator', { language: 'ko' });
    expect(detectCountryCode()).toBeNull();
  });

  test('국가 코드 없이 언어만 있으면 null을 반환한다 ("en")', () => {
    vi.stubGlobal('navigator', { language: 'en' });
    expect(detectCountryCode()).toBeNull();
  });

  test('빈 문자열이면 null을 반환한다', () => {
    vi.stubGlobal('navigator', { language: '' });
    expect(detectCountryCode()).toBeNull();
  });

  test('navigator가 undefined이면 null을 반환한다 (SSR)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(detectCountryCode()).toBeNull();
  });

  test('국가 코드를 대문자로 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'en-gb' });
    expect(detectCountryCode()).toBe('GB');
  });
});
