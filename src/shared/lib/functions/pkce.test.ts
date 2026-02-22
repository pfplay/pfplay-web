import {
  parseCallbackParams,
  setStoredState,
  getStoredState,
  clearStoredState,
  getStoredCodeVerifier,
  clearStoredCodeVerifier,
  createPKCEParams,
} from './pkce';

describe('PKCE', () => {
  describe('parseCallbackParams', () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    test('code와 state 파라미터 파싱', () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?code=abc123&state=xyz' },
        writable: true,
      });
      expect(parseCallbackParams()).toEqual({
        code: 'abc123',
        state: 'xyz',
        error: undefined,
        error_description: undefined,
      });
    });

    test('에러 파라미터 파싱', () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?error=access_denied&error_description=User+denied' },
        writable: true,
      });
      const result = parseCallbackParams();
      expect(result.error).toBe('access_denied');
      expect(result.error_description).toBe('User denied');
    });

    test('파라미터 없으면 undefined 필드 반환', () => {
      Object.defineProperty(window, 'location', {
        value: { search: '' },
        writable: true,
      });
      expect(parseCallbackParams()).toEqual({
        code: undefined,
        state: undefined,
        error: undefined,
        error_description: undefined,
      });
    });
  });

  describe('Storage 함수', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    test('state 저장 → 조회 → 삭제 라이프사이클', () => {
      expect(getStoredState()).toBeNull();

      setStoredState('my-state');
      expect(getStoredState()).toBe('my-state');

      clearStoredState();
      expect(getStoredState()).toBeNull();
    });

    test('codeVerifier 조회 → 삭제 라이프사이클', async () => {
      expect(getStoredCodeVerifier()).toBeNull();

      await createPKCEParams();
      expect(getStoredCodeVerifier()).not.toBeNull();

      clearStoredCodeVerifier();
      expect(getStoredCodeVerifier()).toBeNull();
    });
  });

  describe('createPKCEParams', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    test('codeVerifier가 생성되고 storage에 저장됨', async () => {
      const { codeVerifier } = await createPKCEParams();

      expect(codeVerifier).toBeDefined();
      expect(typeof codeVerifier).toBe('string');
      expect(codeVerifier.length).toBeGreaterThan(0);
      expect(getStoredCodeVerifier()).toBe(codeVerifier);
    });

    test('URL-safe Base64 형식 (+ / = 미포함)', async () => {
      const { codeVerifier } = await createPKCEParams();

      expect(codeVerifier).not.toMatch(/[+/=]/);
    });
  });
});
