import { describe, expect, test } from 'vitest';
import { PREVIEW_PLAYER_SIZES } from './youtube-player.config';

/**
 * YouTube ToS — Required Minimum Functionality: 임베드 플레이어 viewport ≥200×200 (issue #420).
 * 데스크탑 미리듣기(sidebar/modal)는 본 config size 가 그대로 IFrame 크기가 되므로 컴플라이언트여야 한다.
 *
 * `mobile-bottom`(미니플레이어)은 112px 바라 ≥200 영상이 물리적으로 불가 → PR3 에서 전체너비
 * 카드로 재설계하며 별도 처리(본 가드 범위 밖, 의도적 제외).
 */
const MIN_PLAYER_VIEWPORT_PX = 200;

describe('PREVIEW_PLAYER_SIZES · ToS 최소 크기(200×200) 준수 (issue #420)', () => {
  test.each(['sidebar', 'modal'] as const)('데스크탑 %s 미리듣기는 viewport ≥200×200', (key) => {
    const { width, height } = PREVIEW_PLAYER_SIZES[key];
    expect(width).toBeGreaterThanOrEqual(MIN_PLAYER_VIEWPORT_PX);
    expect(height).toBeGreaterThanOrEqual(MIN_PLAYER_VIEWPORT_PX);
  });
});
