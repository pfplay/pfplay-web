/**
 * PKCE (Proof Key for Code Exchange) 유틸리티 함수들
 * OAuth 2.0 Authorization Code Flow with PKCE 구현을 위한 함수들
 */

/**
 * URL-safe Base64 인코딩
 * @param buffer - 인코딩할 ArrayBuffer
 * @returns URL-safe Base64 문자열
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// TODO: session storage 통신 레이어 분리...

/**
 * code_verifier 생성
 * 43-128자의 URL-safe 문자열 생성
 * @returns code_verifier 문자열
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array.buffer);
}

/**
 * PKCE 파라미터 생성 및 저장
 * code_verifier와 code_challenge를 생성하고 sessionStorage에 저장
 * @returns code_challenge와 code_challenge_method
 */
export async function createPKCEParams(): Promise<{
  codeVerifier: string;
}> {
  const codeVerifier = generateCodeVerifier();

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('code_verifier', codeVerifier);
  }

  return {
    codeVerifier,
  };
}

/**
 * 저장된 state 가져오기
 * @returns 저장된 state 또는 null
 */
export function getStoredState(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('state');
  }
  return null;
}

/**
 * state 저장
 * @param state - 저장할 state
 */
export function setStoredState(state: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('state', state);
  }
}

/**
 * 저장된 state 제거
 */
export function clearStoredState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('state');
  }
}

/**
 * 저장된 code_verifier 가져오기
 * @returns 저장된 code_verifier 또는 null
 */
export function getStoredCodeVerifier(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('code_verifier');
  }
  return null;
}

/**
 * 저장된 code_verifier 제거
 */
export function clearStoredCodeVerifier(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('code_verifier');
  }
}

/**
 * URL 파라미터에서 콜백 데이터 파싱
 */
export function parseCallbackParams(): {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
} {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  return {
    code: urlParams.get('code') || undefined,
    state: urlParams.get('state') || undefined,
    error: urlParams.get('error') || undefined,
    error_description: urlParams.get('error_description') || undefined,
  };
}
