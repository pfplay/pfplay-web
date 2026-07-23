import { describe, expect, test } from 'vitest';
import { androidBrowser } from './browser-environment';

const SAMSUNG =
  'Mozilla/5.0 (Linux; Android 13; SM-S911N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36';
const FIREFOX = 'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0';
const CHROME =
  'Mozilla/5.0 (Linux; Android 14; SM-S911N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const GENERIC = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Mobile Safari/537.36';

describe('androidBrowser', () => {
  test('SamsungBrowser 는 UA 에 Chrome 이 섞여 있어도 samsung', () => {
    expect(androidBrowser(SAMSUNG)).toBe('samsung');
  });

  test('Firefox 는 firefox', () => {
    expect(androidBrowser(FIREFOX)).toBe('firefox');
  });

  test('순수 Chrome 은 chrome', () => {
    expect(androidBrowser(CHROME)).toBe('chrome');
  });

  test('식별 토큰이 없으면 other', () => {
    expect(androidBrowser(GENERIC)).toBe('other');
  });
});
