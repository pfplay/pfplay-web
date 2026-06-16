import { urlBase64ToUint8Array, isIOS, iosNeedsInstall, normalizeLang } from './push-support';

describe('urlBase64ToUint8Array', () => {
  test('known base64url 입력을 정확한 바이트로 디코딩한다', () => {
    // 'Man' (no padding case after url-safe transform) -> bytes 77,97,110
    const result = urlBase64ToUint8Array('TWFu');
    expect(Array.from(result)).toEqual([77, 97, 110]);
  });

  test('패딩 누락 + url-safe 문자(-,_)를 처리한다', () => {
    // bytes [255, 254] => standard base64 '//4=' => url-safe(패딩제거) '__4'
    const result = urlBase64ToUint8Array('__4');
    expect(Array.from(result)).toEqual([255, 254]);
  });
});

describe('isIOS', () => {
  test('iPhone UA 는 true', () => {
    expect(isIOS('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(true);
  });

  test('iPad UA 는 true', () => {
    expect(isIOS('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe(true);
  });

  test('Android UA 는 false', () => {
    expect(isIOS('Mozilla/5.0 (Linux; Android 14)')).toBe(false);
  });

  test('데스크톱 UA 는 false', () => {
    expect(isIOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false);
  });
});

describe('iosNeedsInstall', () => {
  const iosUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';
  const desktopUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

  test('iOS + 비-standalone 이면 true', () => {
    expect(iosNeedsInstall(iosUa, false)).toBe(true);
  });

  test('iOS + standalone 이면 false', () => {
    expect(iosNeedsInstall(iosUa, true)).toBe(false);
  });

  test('비-iOS 는 standalone 여부와 무관하게 false', () => {
    expect(iosNeedsInstall(desktopUa, false)).toBe(false);
    expect(iosNeedsInstall(desktopUa, true)).toBe(false);
  });
});

describe('normalizeLang', () => {
  test("'En' -> 'EN'", () => {
    expect(normalizeLang('En')).toBe('EN');
  });

  test("'en' -> 'EN'", () => {
    expect(normalizeLang('en')).toBe('EN');
  });

  test("'ko' -> 'KO'", () => {
    expect(normalizeLang('ko')).toBe('KO');
  });

  test("'KO' -> 'KO'", () => {
    expect(normalizeLang('KO')).toBe('KO');
  });

  test("'Korean' -> 'KO' (KO 로 시작)", () => {
    expect(normalizeLang('Korean')).toBe('KO');
  });

  test("'english' -> 'EN' (KO 로 시작하지 않음)", () => {
    expect(normalizeLang('english')).toBe('EN');
  });
});
