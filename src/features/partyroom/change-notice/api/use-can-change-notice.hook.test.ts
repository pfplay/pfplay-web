vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanChangeNotice from './use-can-change-notice.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanChangeNotice', () => {
  test('me가 없으면 false를 반환한다', () => {
    const { result } = renderHook(() => useCanChangeNotice());
    expect(result.current).toBe(false);
  });

  test('HOST는 공지를 등록할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.HOST } as any });
    const { result } = renderHook(() => useCanChangeNotice());
    expect(result.current).toBe(true);
  });

  test('COMMUNITY_MANAGER는 공지를 등록할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.COMMUNITY_MANAGER } as any });
    const { result } = renderHook(() => useCanChangeNotice());
    expect(result.current).toBe(true);
  });

  test('MODERATOR는 공지를 등록할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanChangeNotice());
    expect(result.current).toBe(false);
  });

  test('CLUBBER는 공지를 등록할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanChangeNotice());
    expect(result.current).toBe(false);
  });
});
