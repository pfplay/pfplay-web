vi.mock('./partyroom-client.context');
vi.mock('@/entities/current-partyroom');
vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/router/use-app-router.hook');
vi.mock('@/shared/ui/components/dialog');
vi.mock('@/shared/lib/localization/i18n.context');

import { renderHook } from '@testing-library/react';
import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';
import { SessionEventType } from '@/shared/api/websocket/types/session';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { usePartyroomClient } from './partyroom-client.context';
import { useSupersededSessionListener } from './use-superseded-session-listener.hook';

const mockSubscribeUserSession = vi.fn();
const mockUnsubscribeUserSession = vi.fn();
const mockUnsubscribeCurrentRoom = vi.fn();
const mockReset = vi.fn();
const mockRemoveCaches = vi.fn();
const mockPush = vi.fn();
const mockOpenAlertDialog = vi.fn();

let currentRoomId: number | null;

const message = (payload: unknown) => ({ body: JSON.stringify(payload) }) as any;

beforeEach(() => {
  vi.clearAllMocks();
  currentRoomId = 10;
  (usePartyroomClient as Mock).mockReturnValue({
    subscribeUserSession: mockSubscribeUserSession,
    unsubscribeUserSession: mockUnsubscribeUserSession,
    unsubscribeCurrentRoom: mockUnsubscribeCurrentRoom,
  });
  (useRemoveCurrentPartyroomCaches as Mock).mockReturnValue(mockRemoveCaches);
  const state = { id: currentRoomId, reset: mockReset };
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: Object.assign((selector: (...args: any[]) => any) => selector(state), {
      getState: () => ({ ...state, id: currentRoomId }),
    }),
  });
  (useAppRouter as Mock).mockReturnValue({ push: mockPush });
  (useDialog as Mock).mockReturnValue({ openAlertDialog: mockOpenAlertDialog });
  (useI18n as Mock).mockReturnValue({ party: { para: { superseded: '밀려남' } } });
});

const getHandler = () => {
  renderHook(() => useSupersededSessionListener());
  return mockSubscribeUserSession.mock.calls[0][0] as (m: any) => void;
};

describe('useSupersededSessionListener (#476)', () => {
  test('마운트 시 유저 세션 큐를 구독하고, 언마운트 시 해지한다', () => {
    const { unmount } = renderHook(() => useSupersededSessionListener());
    expect(mockSubscribeUserSession).toHaveBeenCalledTimes(1);
    unmount();
    expect(mockUnsubscribeUserSession).toHaveBeenCalledTimes(1);
  });

  test('현재 방 == supersededPartyroomId → 로컬 teardown + 로비 + 안내 모달, exit API 미호출', () => {
    currentRoomId = 10;
    const handler = getHandler();

    handler(
      message({
        type: SessionEventType.SESSION_SUPERSEDED,
        newPartyroomId: 20,
        supersededPartyroomId: 10,
        occurredAt: 1,
      })
    );

    expect(mockUnsubscribeCurrentRoom).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockRemoveCaches).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/parties');
    expect(mockOpenAlertDialog).toHaveBeenCalledTimes(1);
  });

  test('현재 방 != supersededPartyroomId (새 세션 B) → 무시', () => {
    currentRoomId = 20; // 이 세션은 새 방 20 에 있음
    const handler = getHandler();

    handler(
      message({
        type: SessionEventType.SESSION_SUPERSEDED,
        newPartyroomId: 20,
        supersededPartyroomId: 10,
        occurredAt: 1,
      })
    );

    expect(mockUnsubscribeCurrentRoom).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockOpenAlertDialog).not.toHaveBeenCalled();
  });

  test('현재 방 없음(로비) → 무시', () => {
    currentRoomId = null;
    const handler = getHandler();

    handler(
      message({
        type: SessionEventType.SESSION_SUPERSEDED,
        newPartyroomId: 20,
        supersededPartyroomId: 10,
        occurredAt: 1,
      })
    );

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('SESSION_SUPERSEDED 가 아닌/파싱 불가 메시지 → 무시', () => {
    const handler = getHandler();
    handler(message({ type: 'SOMETHING_ELSE' }));
    handler({ body: 'not-json' } as any);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
