/**
 * 1:1 대응이 명확한 언어 코드 → 국가 코드 매핑.
 * 여러 나라에서 쓰는 언어(en, es, fr, pt 등)는 의도적으로 제외.
 */
const LANG_TO_COUNTRY: Record<string, string> = {
  ko: 'KR',
  ja: 'JP',
  uk: 'UA',
  vi: 'VN',
  th: 'TH',
  he: 'IL',
  hi: 'IN',
  bn: 'BD',
  ka: 'GE',
  hy: 'AM',
  km: 'KH',
  mn: 'MN',
  my: 'MM',
  ne: 'NP',
  si: 'LK',
  lo: 'LA',
};

/**
 * 브라우저 언어 설정에서 ISO 3166-1 alpha-2 국가 코드를 추출한다.
 * 브라우저 환경이 아니거나 추출 불가한 경우 null을 반환한다.
 *
 * 탐색 순서:
 * 1. navigator.language에서 지역 코드 추출 (e.g. "ko-KR" → "KR")
 * 2. navigator.languages에서 지역 코드가 포함된 항목 탐색
 * 3. 언어 코드 → 국가 코드 매핑 (e.g. "ko" → "KR")
 *
 * @example
 * // navigator.language === "ko-KR"
 * detectCountryCode() // "KR"
 *
 * // navigator.language === "ko", navigator.languages === ["ko", "en"]
 * detectCountryCode() // "KR" (fallback via lang-to-country map)
 */
export function detectCountryCode(): string | null {
  if (typeof navigator === 'undefined' || !navigator?.language) {
    return null;
  }

  // 1. navigator.language에서 직접 추출
  const fromPrimary = extractCountryCode(navigator.language);
  if (fromPrimary) return fromPrimary;

  // 2. navigator.languages에서 지역 코드가 포함된 항목 탐색
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const code = extractCountryCode(lang);
      if (code) return code;
    }
  }

  // 3. 언어 코드 → 국가 코드 매핑 (1:1 대응 언어만)
  const langCode = navigator.language.split('-')[0]?.toLowerCase();
  if (langCode && LANG_TO_COUNTRY[langCode]) {
    return LANG_TO_COUNTRY[langCode];
  }

  return null;
}

function extractCountryCode(locale: string): string | null {
  const parts = locale.split('-');
  if (parts.length < 2 || !parts[1]) return null;
  return parts[1].toUpperCase();
}
