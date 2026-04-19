vi.mock('@/shared/lib/store/stores.context');

import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { DjingQueue } from '@/shared/api/http/types/partyrooms';
import { PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useDjQueueChangedCallback from './use-dj-queue-changed-callback.hook';

const updateCurrentDj = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({
        id: undefined,
        updateCurrentDj,
      }),
  });
});

const createQueue = (djs: DjingQueue['djs'] = []): DjingQueue => ({
  playbackActivated: true,
  queueStatus: QueueStatus.OPEN,
  registered: false,
  djs,
});

const createEvent = () => ({
  eventType: PartyroomEventType.DJ_QUEUE_CHANGED as const,
  partyroomId: 123,
  id: 'event-id',
  timestamp: Date.now(),
  djs: [
    {
      crewId: 2,
      orderNumber: 2,
      nickname: 'User2',
      avatarIconUri: 'user2.png',
    },
    {
      crewId: 1,
      orderNumber: 1,
      nickname: 'User1',
      avatarIconUri: 'user1.png',
    },
  ],
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
});
