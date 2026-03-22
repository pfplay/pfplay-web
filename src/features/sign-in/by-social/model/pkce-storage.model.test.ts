import { StorageKey, PKCEStorage } from './pkce-storage.model';

describe('PKCEStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('setItem 후 getItem으로 저장된 값 반환', () => {
    PKCEStorage.setItem(StorageKey.CODE_VERIFIER, 'test-verifier');

    expect(PKCEStorage.getItem(StorageKey.CODE_VERIFIER)).toBe('test-verifier');
  });

  test('removeItem 후 getItem은 null 반환', () => {
    PKCEStorage.setItem(StorageKey.STATE, 'test-state');
    PKCEStorage.removeItem(StorageKey.STATE);

    expect(PKCEStorage.getItem(StorageKey.STATE)).toBeNull();
  });

  test('각 StorageKey(CODE_VERIFIER, STATE) 독립적으로 동작', () => {
    PKCEStorage.setItem(StorageKey.CODE_VERIFIER, 'verifier-value');
    PKCEStorage.setItem(StorageKey.STATE, 'state-value');

    expect(PKCEStorage.getItem(StorageKey.CODE_VERIFIER)).toBe('verifier-value');
    expect(PKCEStorage.getItem(StorageKey.STATE)).toBe('state-value');
  });

  test('서로 다른 키는 독립적으로 저장되어 하나를 삭제해도 다른 키에 영향 없음', () => {
    PKCEStorage.setItem(StorageKey.CODE_VERIFIER, 'verifier-value');
    PKCEStorage.setItem(StorageKey.STATE, 'state-value');

    PKCEStorage.removeItem(StorageKey.CODE_VERIFIER);

    expect(PKCEStorage.getItem(StorageKey.CODE_VERIFIER)).toBeNull();
    expect(PKCEStorage.getItem(StorageKey.STATE)).toBe('state-value');
  });

  test('저장되지 않은 키를 조회하면 null 반환', () => {
    expect(PKCEStorage.getItem(StorageKey.CODE_VERIFIER)).toBeNull();
    expect(PKCEStorage.getItem(StorageKey.STATE)).toBeNull();
  });
});
