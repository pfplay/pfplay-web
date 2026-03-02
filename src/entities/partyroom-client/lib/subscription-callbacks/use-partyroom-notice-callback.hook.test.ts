jest.mock('@/shared/lib/store/stores.context');

import { renderHook } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import usePartyroomNoticeCallback from './use-partyroom-notice-callback.hook';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  jest.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as jest.Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('usePartyroomNoticeCallback', () => {
  test('notice를 event.content로 업데이트한다', () => {
    const { result } = renderHook(() => usePartyroomNoticeCallback());
    const callback = result.current;

    callback({
      eventType: PartyroomEventType.PARTYROOM_NOTICE,
      content: '새로운 공지사항입니다',
    });

    expect(store.getState().notice).toBe('새로운 공지사항입니다');
  });

  test('빈 문자열로도 업데이트할 수 있다', () => {
    const { result } = renderHook(() => usePartyroomNoticeCallback());
    const callback = result.current;

    // 먼저 공지 설정
    store.getState().updateNotice('기존 공지');

    callback({
      eventType: PartyroomEventType.PARTYROOM_NOTICE,
      content: '',
    });

    expect(store.getState().notice).toBe('');
  });
});
