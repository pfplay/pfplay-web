vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/analytics/room-tracking', () => ({
  trackDjAdminDeregisterDetected: vi.fn(),
}));

import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { trackDjAdminDeregisterDetected } from '@/shared/lib/analytics/room-tracking';
import { useStores } from '@/shared/lib/store/stores.context';
import useDjQueueChangedCallback from './use-dj-queue-changed-callback.hook';

const updateCurrentDj = vi.fn();
const mockGetState = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockGetState.mockReturnValue({ me: undefined });
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: Object.assign(
      (selector: (...args: any[]) => any) => selector({ id: undefined, updateCurrentDj }),
      { getState: mockGetState }
    ),
  });
});

const createQueue = (djs: DjingQueue['djs'] = []): DjingQueue => ({
  playbackActivated: true,
  queueStatus: QueueStatus.OPEN,
  registered: false,
  djs,
});

const createDj = (crewId: number, orderNumber: number) => ({
  crewId,
  orderNumber,
  nickname: `User${crewId}`,
  avatarIconUri: `user${crewId}.png`,
});

const createEvent = (djs = [createDj(2, 2), createDj(1, 1)]) => ({
  eventType: PartyroomEventType.DJ_QUEUE_CHANGED as const,
  partyroomId: 123,
  id: 'event-id',
  timestamp: Date.now(),
  djs,
});

describe('useDjQueueChangedCallback', () => {
  test('이벤트 partyroomId 기준으로 DJ queue 캐시를 갱신한다', () => {
    const { result, queryClient } = renderWithClient(() => useDjQueueChangedCallback());
    queryClient.setQueryData([QueryKeys.DjingQueue, 123], createQueue());

    result.current(createEvent());

    expect(queryClient.getQueryData<DjingQueue>([QueryKeys.DjingQueue, 123])?.djs).toEqual(
      createEvent().djs
    );
    expect(queryClient.getQueryData([QueryKeys.DjingQueue, undefined])).toBeUndefined();
  });

  test('orderNumber가 가장 낮은 DJ를 현재 DJ로 갱신한다', () => {
    const { result, queryClient } = renderWithClient(() => useDjQueueChangedCallback());
    queryClient.setQueryData([QueryKeys.DjingQueue, 123], createQueue());

    result.current(createEvent());

    expect(updateCurrentDj).toHaveBeenCalledWith({ crewId: 1 });
  });

  describe('self admin deregister detection (Med3)', () => {
    test('내가 큐에 있다가 사라지면 trackDjAdminDeregisterDetected 호출', () => {
      mockGetState.mockReturnValue({ me: { crewId: 1 } });
      const { result, queryClient } = renderWithClient(() => useDjQueueChangedCallback());
      queryClient.setQueryData(
        [QueryKeys.DjingQueue, 123],
        createQueue([createDj(1, 1), createDj(2, 2)])
      );

      // 새 이벤트에서는 crewId=1 이 사라짐
      result.current(createEvent([createDj(2, 1)]));

      expect(trackDjAdminDeregisterDetected).toHaveBeenCalledWith(123);
    });

    test('내가 여전히 큐에 있으면 호출 안 함', () => {
      mockGetState.mockReturnValue({ me: { crewId: 1 } });
      const { result, queryClient } = renderWithClient(() => useDjQueueChangedCallback());
      queryClient.setQueryData(
        [QueryKeys.DjingQueue, 123],
        createQueue([createDj(1, 1), createDj(2, 2)])
      );

      result.current(createEvent([createDj(1, 1), createDj(2, 2), createDj(3, 3)]));

      expect(trackDjAdminDeregisterDetected).not.toHaveBeenCalled();
    });

    test('내가 처음부터 큐에 없었으면 호출 안 함', () => {
      mockGetState.mockReturnValue({ me: { crewId: 99 } });
      const { result, queryClient } = renderWithClient(() => useDjQueueChangedCallback());
      queryClient.setQueryData(
        [QueryKeys.DjingQueue, 123],
        createQueue([createDj(1, 1), createDj(2, 2)])
      );

      result.current(createEvent([createDj(2, 1)]));

      expect(trackDjAdminDeregisterDetected).not.toHaveBeenCalled();
    });

    test('me.crewId 미설정 시 호출 안 함 (입장 직후 race)', () => {
      mockGetState.mockReturnValue({ me: undefined });
      const { result, queryClient } = renderWithClient(() => useDjQueueChangedCallback());
      queryClient.setQueryData([QueryKeys.DjingQueue, 123], createQueue([createDj(1, 1)]));

      result.current(createEvent([]));

      expect(trackDjAdminDeregisterDetected).not.toHaveBeenCalled();
    });

    test('이전 캐시가 없으면 (첫 이벤트) 호출 안 함', () => {
      mockGetState.mockReturnValue({ me: { crewId: 1 } });
      const { result } = renderWithClient(() => useDjQueueChangedCallback());

      result.current(createEvent([createDj(2, 1)]));

      expect(trackDjAdminDeregisterDetected).not.toHaveBeenCalled();
    });
  });
});
