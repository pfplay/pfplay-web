vi.mock('@/shared/lib/localization/lang.context', () => ({
  useLang: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ common: { btn: { eng: 'English', kor: '한국어' } } }),
}));

import { renderHook } from '@testing-library/react';
import { useLang } from '@/shared/lib/localization/lang.context';
import useLanguages from './use-languages.hook';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useLanguages', () => {
  test('영어와 한국어 옵션을 반환한다', () => {
    (useLang as Mock).mockReturnValue('en');
    const { result } = renderHook(() => useLanguages());
    expect(result.current).toHaveLength(2);
    expect(result.current[0].label).toBe('English');
    expect(result.current[1].label).toBe('한국어');
  });

  test('현재 언어가 en이면 영어의 isCurrent가 true이다', () => {
    (useLang as Mock).mockReturnValue('en');
    const { result } = renderHook(() => useLanguages());
    expect(result.current[0].isCurrent).toBe(true);
    expect(result.current[1].isCurrent).toBe(false);
  });

  test('현재 언어가 ko이면 한국어의 isCurrent가 true이다', () => {
    (useLang as Mock).mockReturnValue('ko');
    const { result } = renderHook(() => useLanguages());
    expect(result.current[0].isCurrent).toBe(false);
    expect(result.current[1].isCurrent).toBe(true);
  });
});
