import { describe, expect, it } from 'vitest';

import { normalizeYoutubeSearchInput } from './normalize-youtube-search';

const CANON = 'https://www.youtube.com/watch?v=7uqoJ1_spiQ';

describe('normalizeYoutubeSearchInput', () => {
  it('이미 canonical watch URL → 동일 canonical', () => {
    expect(normalizeYoutubeSearchInput('https://www.youtube.com/watch?v=7uqoJ1_spiQ')).toBe(CANON);
  });

  it('youtu.be + list 파라미터 → canonical', () => {
    expect(normalizeYoutubeSearchInput('https://youtu.be/7uqoJ1_spiQ?list=LL')).toBe(CANON);
  });

  it('watch + list + index 파라미터 → canonical', () => {
    expect(
      normalizeYoutubeSearchInput('https://www.youtube.com/watch?v=7uqoJ1_spiQ&list=LL&index=17')
    ).toBe(CANON);
  });

  it('m./music. 서브도메인 → canonical', () => {
    expect(normalizeYoutubeSearchInput('https://m.youtube.com/watch?v=7uqoJ1_spiQ')).toBe(CANON);
    expect(normalizeYoutubeSearchInput('https://music.youtube.com/watch?v=7uqoJ1_spiQ')).toBe(
      CANON
    );
  });

  it('shorts URL도 canonical로 정규화된다(검색은 결과없음으로 degrade)', () => {
    expect(normalizeYoutubeSearchInput('https://www.youtube.com/shorts/7uqoJ1_spiQ')).toBe(CANON);
  });

  it('일반 검색어는 그대로 반환(trim만)', () => {
    expect(normalizeYoutubeSearchInput('아이유 밤편지')).toBe('아이유 밤편지');
    expect(normalizeYoutubeSearchInput('  newjeans ditto  ')).toBe('newjeans ditto');
  });

  it('유튜브가 아닌 URL은 그대로 반환', () => {
    expect(normalizeYoutubeSearchInput('https://www.google.com')).toBe('https://www.google.com');
  });

  it('빈 문자열 → 빈 문자열', () => {
    expect(normalizeYoutubeSearchInput('   ')).toBe('');
  });
});
