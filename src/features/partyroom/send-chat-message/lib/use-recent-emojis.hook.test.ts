import { act, renderHook, waitFor } from '@testing-library/react';
import useRecentEmojis, { RECENT_EMOJIS_STORAGE_KEY } from './use-recent-emojis.hook';

describe('useRecentEmojis (#439)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('초기값은 빈 배열, 마운트 후 localStorage에서 로드', async () => {
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(['🔥', '🎉']));
    const { result } = renderHook(() => useRecentEmojis());
    await waitFor(() => expect(result.current.recents).toEqual(['🔥', '🎉']));
  });

  test('addRecent — MRU 맨 앞 삽입 + 중복 제거', async () => {
    const { result } = renderHook(() => useRecentEmojis());
    act(() => result.current.addRecent('🎧'));
    act(() => result.current.addRecent('🔥'));
    act(() => result.current.addRecent('🎧'));
    expect(result.current.recents).toEqual(['🎧', '🔥']);
    expect(JSON.parse(localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY) ?? '')).toEqual(['🎧', '🔥']);
  });

  test('최대 8개 절삭 — 가장 오래된 항목 탈락', async () => {
    const seed = ['1', '2', '3', '4', '5', '6', '7', '8'];
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(seed));
    const { result } = renderHook(() => useRecentEmojis());
    await waitFor(() => expect(result.current.recents).toHaveLength(8));
    act(() => result.current.addRecent('9'));
    expect(result.current.recents).toEqual(['9', '1', '2', '3', '4', '5', '6', '7']);
  });

  test('저장 실패(프라이빗 모드 등)여도 메모리 recents는 갱신', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useRecentEmojis());
    expect(() => act(() => result.current.addRecent('🔥'))).not.toThrow();
    expect(result.current.recents).toEqual(['🔥']);
  });

  test('저장값이 손상(JSON 아님/배열 아님)이어도 빈 배열로 동작', async () => {
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, 'not-json{');
    const { result } = renderHook(() => useRecentEmojis());
    // 마운트 로드가 끝난 뒤에도 여전히 빈 배열이어야 한다
    await waitFor(() => expect(result.current.recents).toEqual([]));
  });
});
