/**
 * navigator.language에서 ISO 3166-1 alpha-2 국가 코드를 추출한다.
 * 브라우저 환경이 아니거나 추출 불가한 경우 null을 반환한다.
 *
 * @example
 * // navigator.language === "ko-KR"
 * detectCountryCode() // "KR"
 *
 * // navigator.language === "en"
 * detectCountryCode() // null
 */
export function detectCountryCode(): string | null {
  if (typeof navigator === 'undefined' || !navigator?.language) {
    return null;
  }

  const parts = navigator.language.split('-');
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  return parts[1].toUpperCase();
}
