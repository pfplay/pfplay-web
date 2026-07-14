import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * #414 데스크톱-무영향 불변식의 구조 회귀 가드.
 * CSS 미디어쿼리는 jsdom 이 평가하지 못하므로(런타임 단언 불가), 대신 파일 구조로
 * "모든 터치 리셋이 (hover: none) and (pointer: coarse) 안에만 있고, 전역 user-select 가 없음" 을 단언한다.
 */
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'touch-reset.css'), 'utf-8');

// 주석 제거 후 공백 정규화
const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '').trim();

describe('touch-reset.css — 데스크톱 무영향 불변식 (#414)', () => {
  test('모든 규칙이 (hover: none) and (pointer: coarse) 미디어 블록 안에만 있다', () => {
    // 주석 제외 본문이 정확히 하나의 coarse 미디어 블록으로 감싸여야 한다(밖에 떠도는 규칙 0).
    expect(stripped).toMatch(/^@media \(hover: none\) and \(pointer: coarse\) \{[\s\S]*\}$/);
    // any-pointer 사용 금지(터치 노트북까지 매칭 → 데스크톱 오염)
    expect(stripped).not.toContain('any-pointer');
  });

  test('user-select 가 전역(*, html, body, :root)에 적용되지 않는다 — 콘텐츠 선택 보존', () => {
    expect(stripped).not.toMatch(/\*\s*\{[^}]*user-select/);
    expect(stripped).not.toMatch(/\b(html|body|:root)\s*\{[^}]*user-select/);
    // user-select 는 인터랙티브 크롬(button 등)에만
    expect(stripped).toMatch(/button[\s\S]*?\{[^}]*user-select:\s*none/);
  });

  test('focus 링 제거는 :focus:not(:focus-visible) 만 — 키보드 a11y 보존', () => {
    expect(stripped).toContain(':focus:not(:focus-visible)');
    // 무조건적 outline:none(:focus 전체 제거) 금지
    expect(stripped).not.toMatch(/(?<!:not\(:focus-visible\))\s*:focus\s*\{[^}]*outline:\s*none/);
  });
});
