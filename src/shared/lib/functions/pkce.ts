import { PKCEStorage, StorageKey } from '@/features/sign-in/by-social/model/pkce-storage.model';

/**
 * URL-safe Base64 인코딩
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * code_verifier 생성
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array.buffer);
}

/**
 * PKCE 파라미터 생성 및 저장
 */
export async function createPKCEParams(): Promise<{
  codeVerifier: string;
}> {
  const codeVerifier = generateCodeVerifier();
  PKCEStorage.setItem(StorageKey.CODE_VERIFIER, codeVerifier);
  return {
    codeVerifier,
  };
}

/**
 * 저장된 state 가져오기
 */
export function getStoredState(): string | null {
  return PKCEStorage.getItem(StorageKey.STATE);
}

/**
 * state 저장
 */
export function setStoredState(state: string): void {
  PKCEStorage.setItem(StorageKey.STATE, state);
}

/**
 * 저장된 state 제거
 */
export function clearStoredState(): void {
  PKCEStorage.removeItem(StorageKey.STATE);
}

/**
 * 저장된 code_verifier 가져오기
 */
export function getStoredCodeVerifier(): string | null {
  return PKCEStorage.getItem(StorageKey.CODE_VERIFIER);
}

/**
 * 저장된 code_verifier 제거
 */
export function clearStoredCodeVerifier(): void {
  PKCEStorage.removeItem(StorageKey.CODE_VERIFIER);
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
