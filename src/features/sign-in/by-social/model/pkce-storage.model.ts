enum StorageKey {
  CODE_VERIFIER = 'CODE_VERIFIER',
  STATE = 'STATE',
}

/**
 * PKCE 스코리지 추상화 클래스
 */
class PKCEStorage {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public static getItem(key: StorageKey): string | null {
    if (!this.isClient()) return null;
    return sessionStorage.getItem(key);
  }

  public static setItem(key: StorageKey, value: string): void {
    if (!this.isClient()) return;
    sessionStorage.setItem(key, value);
  }

  public static removeItem(key: StorageKey): void {
    if (!this.isClient()) return;
    sessionStorage.removeItem(key);
  }
}

export { StorageKey, PKCEStorage };
