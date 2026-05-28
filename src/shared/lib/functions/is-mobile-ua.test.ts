import { isMobileUA } from './is-mobile-ua';

describe('isMobileUA', () => {
  test('iPhone Safari UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Android Chrome UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('iPod UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('BlackBerry UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (BB10; Kbd) AppleWebKit/537.35+ (KHTML, like Gecko) Version/10.3.3.2205 Mobile Safari/537.35+';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Opera Mini UA를 모바일로 판별한다', () => {
    const ua =
      'Opera/9.80 (Android; Opera Mini/36.2.2254/191.241; U; en) Presto/2.12.423 Version/12.16';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('데스크탑 Chrome UA를 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('데스크탑 Firefox UA를 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:120.0) Gecko/20100101 Firefox/120.0';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('데스크탑 Safari UA를 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('iPadOS 13+는 데스크탑 Safari UA를 전송하므로 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('빈 문자열은 데스크탑으로 판별한다', () => {
    expect(isMobileUA('')).toBe(false);
  });

  test('KAKAOTALK 임베디드 WebView UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; SM-S908N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 KAKAOTALK 10.4.5';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('NAVER 임베디드 WebView UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; SM-S918N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 NAVER(inapp; search; 1340; 12.6.4)';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Facebook 임베디드 WebView UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; SM-S908N Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0.0.34.83;]';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Android Tablet UA를 모바일로 판별한다 (Mobile 토큰 없어도 Android 매칭)', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Googlebot UA를 데스크탑으로 판별한다 (Mobile 토큰 없는 봇)', () => {
    const ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('Googlebot Mobile UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    expect(isMobileUA(ua)).toBe(true);
  });
});
