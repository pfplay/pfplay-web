import { CHAT_EMOJIS } from './emoji-set';

describe('CHAT_EMOJIS (#439)', () => {
  test('40개 고정', () => {
    expect(CHAT_EMOJIS).toHaveLength(40);
  });

  test('중복 없음 (raw string 비교 — VS16 정규화 금지)', () => {
    expect(new Set<string>(CHAT_EMOJIS).size).toBe(CHAT_EMOJIS.length);
  });
});
