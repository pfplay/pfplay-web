import { detectCountryCode } from './detect-country-code';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectCountryCode', () => {
  describe('navigator.language에서 직접 추출', () => {
    test('"ko-KR"이면 "KR"을 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'ko-KR', languages: ['ko-KR'] });
      expect(detectCountryCode()).toBe('KR');
    });

    test('"en-US"이면 "US"를 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US'] });
      expect(detectCountryCode()).toBe('US');
    });

    test('"ja-JP"이면 "JP"를 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'ja-JP', languages: ['ja-JP'] });
      expect(detectCountryCode()).toBe('JP');
    });

    test('"zh-TW"이면 "TW"를 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'zh-TW', languages: ['zh-TW'] });
      expect(detectCountryCode()).toBe('TW');
    });

    test('국가 코드를 대문자로 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'en-gb', languages: ['en-gb'] });
      expect(detectCountryCode()).toBe('GB');
    });
  });

  describe('navigator.languages fallback', () => {
    test('language에 지역 코드가 없으면 languages에서 찾는다', () => {
      vi.stubGlobal('navigator', { language: 'ko', languages: ['ko', 'en-US'] });
      expect(detectCountryCode()).toBe('US');
    });

    test('languages의 첫 번째 지역 코드를 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'en', languages: ['en', 'ko-KR', 'ja-JP'] });
      expect(detectCountryCode()).toBe('KR');
    });
  });

  describe('언어 코드 → 국가 코드 매핑 fallback', () => {
    test('"ko"만 있으면 매핑으로 "KR"을 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'ko', languages: ['ko', 'en'] });
      expect(detectCountryCode()).toBe('KR');
    });

    test('"ja"만 있으면 매핑으로 "JP"를 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'ja', languages: ['ja'] });
      expect(detectCountryCode()).toBe('JP');
    });

    test('"vi"만 있으면 매핑으로 "VN"을 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'vi', languages: ['vi'] });
      expect(detectCountryCode()).toBe('VN');
    });

    test('매핑에 없는 언어("en")만 있으면 null을 반환한다', () => {
      vi.stubGlobal('navigator', { language: 'en', languages: ['en'] });
      expect(detectCountryCode()).toBeNull();
    });
  });

  describe('edge cases', () => {
    test('빈 문자열이면 null을 반환한다', () => {
      vi.stubGlobal('navigator', { language: '', languages: [] });
      expect(detectCountryCode()).toBeNull();
    });

    test('navigator가 undefined이면 null을 반환한다 (SSR)', () => {
      vi.stubGlobal('navigator', undefined);
      expect(detectCountryCode()).toBeNull();
    });

    test('languages가 없어도 매핑 fallback이 동작한다', () => {
      vi.stubGlobal('navigator', { language: 'ko' });
      expect(detectCountryCode()).toBe('KR');
    });
  });
});
