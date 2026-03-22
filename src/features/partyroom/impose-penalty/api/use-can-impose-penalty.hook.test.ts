vi.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import useCanImposePenalty from './use-can-impose-penalty.hook';
import useCanRemoveChatMessage from './use-can-remove-chat-message.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('useCanImposePenalty', () => {
  test('me가 없으면 항상 false를 반환한다', () => {
    const { result } = renderHook(() => useCanImposePenalty());
    expect(result.current(GradeType.CLUBBER)).toBe(false);
  });

  test('MODERATOR는 하위 등급에 패널티를 부과할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanImposePenalty());

    expect(result.current(GradeType.CLUBBER)).toBe(true);
    expect(result.current(GradeType.LISTENER)).toBe(true);
  });

  test('MODERATOR는 동등 이상 등급에 패널티를 부과할 수 없다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanImposePenalty());

    expect(result.current(GradeType.MODERATOR)).toBe(false);
    expect(result.current(GradeType.HOST)).toBe(false);
  });

  test('CLUBBER는 패널티 부과 권한이 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanImposePenalty());
    expect(result.current(GradeType.LISTENER)).toBe(false);
  });
});

describe('useCanRemoveChatMessage', () => {
  test('me가 없으면 항상 false를 반환한다', () => {
    const { result } = renderHook(() => useCanRemoveChatMessage());
    expect(result.current(GradeType.CLUBBER)).toBe(false);
  });

  test('MODERATOR는 하위 등급의 채팅을 삭제할 수 있다', () => {
    store.setState({ me: { gradeType: GradeType.MODERATOR } as any });
    const { result } = renderHook(() => useCanRemoveChatMessage());
    expect(result.current(GradeType.CLUBBER)).toBe(true);
  });

  test('CLUBBER는 채팅 삭제 권한이 없다', () => {
    store.setState({ me: { gradeType: GradeType.CLUBBER } as any });
    const { result } = renderHook(() => useCanRemoveChatMessage());
    expect(result.current(GradeType.LISTENER)).toBe(false);
  });
});
