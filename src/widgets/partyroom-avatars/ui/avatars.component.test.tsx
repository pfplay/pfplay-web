/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { AvatarCompositionType, GradeType, MotionType } from '@/shared/api/http/types/@enums';
import Avatars from './avatars.component';

const useFetchDjingQueueMock = vi.fn();
const useAvatarClusterMock = vi.fn(
  ({ crews, djQueueCrewIds }: { crews: Array<{ crewId: number }>; djQueueCrewIds: number[] }) => ({
    courtPositions: crews
      .filter((crew) => !djQueueCrewIds.includes(crew.crewId))
      .map((crew, index) => ({
        crewId: crew.crewId,
        position: { x: index * 10, y: index * 10 },
      })),
    queuePositions: crews
      .filter((crew) => djQueueCrewIds.includes(crew.crewId))
      .map((crew, index) => ({
        crewId: crew.crewId,
        position: { x: index * 10, y: index * 10 },
      })),
  })
);
const useStoresMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

vi.mock('@/features/partyroom/list-djing-queue', () => ({
  useFetchDjingQueue: (...args: unknown[]) => useFetchDjingQueueMock(...args),
}));

vi.mock('@/entities/avatar', () => ({
  Avatar: () => <div data-testid='avatar' />,
}));

vi.mock('@/entities/avatar/ui/useAvatarDance.hook', () => ({
  useAvatarDance: () => ({ registerAvatar: vi.fn() }),
}));

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => useStoresMock(),
}));

vi.mock('../lib/use-avatar-cluster.hook', () => ({
  useAvatarCluster: (...args: Parameters<typeof useAvatarClusterMock>) =>
    useAvatarClusterMock(...args),
}));

const createCrew = (crewId: number) => ({
  crewId,
  nickname: `crew-${crewId}`,
  gradeType: GradeType.CLUBBER,
  avatarCompositionType: AvatarCompositionType.SINGLE_BODY,
  avatarBodyUri: `body-${crewId}.png`,
  avatarFaceUri: '',
  avatarIconUri: `icon-${crewId}.png`,
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
});

describe('Avatars', () => {
  let store: ReturnType<typeof createCurrentPartyroomStore>;

  beforeEach(() => {
    vi.clearAllMocks();

    global.ResizeObserver = class ResizeObserver {
      public observe() {}
      public disconnect() {}
      public unobserve() {}
    };

    store = createCurrentPartyroomStore();
    useStoresMock.mockReturnValue({ useCurrentPartyroom: store });
    useFetchDjingQueueMock.mockReturnValue({ data: { djs: [] } });
  });

  test('DJ queue avatar는 현재 DJ를 제외하고 최대 5명만 렌더링한다', () => {
    store.setState({
      crews: [1, 2, 3, 4, 5, 6, 7].map(createCrew),
      currentDj: { crewId: 1 },
    });
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 4, orderNumber: 4 },
          { crewId: 1, orderNumber: 1 },
          { crewId: 6, orderNumber: 6 },
          { crewId: 3, orderNumber: 3 },
          { crewId: 7, orderNumber: 7 },
          { crewId: 2, orderNumber: 2 },
          { crewId: 5, orderNumber: 5 },
        ].map(({ crewId, orderNumber }) => ({
          crewId,
          orderNumber,
          nickname: `dj-${crewId}`,
          avatarIconUri: `icon-${crewId}.png`,
        })),
      },
    });

    render(<Avatars />);

    const queueItems = screen.getAllByTestId('partyroom-dj-queue-item');
    expect(queueItems).toHaveLength(5);
    expect(useAvatarClusterMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ djQueueCrewIds: [2, 3, 4, 5, 6] })
    );
  });

  test('djQueueCrewIdsOverride가 fetch queue보다 우선한다', () => {
    store.setState({
      crews: [1, 2, 3, 4].map(createCrew),
      currentDj: { crewId: 1 },
    });
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 1, orderNumber: 1 },
          { crewId: 2, orderNumber: 2 },
        ].map(({ crewId, orderNumber }) => ({
          crewId,
          orderNumber,
          nickname: `dj-${crewId}`,
          avatarIconUri: `icon-${crewId}.png`,
        })),
      },
    });

    render(<Avatars djQueueCrewIdsOverride={[4, 3]} />);

    const queueItems = screen.getAllByTestId('partyroom-dj-queue-item');
    expect(queueItems.map((item) => item.getAttribute('data-crew-id'))).toEqual(['3', '4']);
    expect(useAvatarClusterMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ djQueueCrewIds: [4, 3] })
    );
  });

  test('djQueueCrewIdsOverride가 5명을 초과해도 DJ queue avatar는 최대 5명만 렌더링한다', () => {
    store.setState({
      crews: [1, 2, 3, 4, 5, 6, 7].map(createCrew),
      currentDj: { crewId: 1 },
    });

    render(<Avatars djQueueCrewIdsOverride={[2, 3, 4, 5, 6, 7]} />);

    const queueItems = screen.getAllByTestId('partyroom-dj-queue-item');
    expect(queueItems).toHaveLength(5);
    expect(useAvatarClusterMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ djQueueCrewIds: [2, 3, 4, 5, 6] })
    );
  });

  test('chatSignals와 crewId가 일치하는 DJ queue 아바타에 mail bounce signal을 렌더링한다', () => {
    store.setState({
      crews: [createCrew(1), createCrew(2)],
      currentDj: { crewId: 1 },
      chatSignals: { 2: 123 },
    });

    render(<Avatars djQueueCrewIdsOverride={[2]} />);

    const queueAvatar = screen.getByTestId('partyroom-dj-queue-item');
    expect(queueAvatar.getAttribute('data-crew-id')).toBe('2');
    expect(within(queueAvatar).getByTestId('mail-bounce-signal')).toBeInTheDocument();
  });

  test('chatSignals와 crewId가 일치하는 floor 아바타에 mail bounce signal을 렌더링한다', () => {
    store.setState({
      crews: [createCrew(1), createCrew(2)],
      currentDj: { crewId: 1 },
      chatSignals: { 2: 123 },
    });

    render(<Avatars />);

    const floorAvatar = screen.getByTestId('partyroom-crew-item');
    expect(floorAvatar.getAttribute('data-crew-id')).toBe('2');
    expect(within(floorAvatar).getByTestId('mail-bounce-signal')).toBeInTheDocument();
  });

  test('current DJ chatSignals도 mail bounce signal을 렌더링한다', () => {
    store.setState({
      crews: [createCrew(1)],
      currentDj: { crewId: 1 },
      chatSignals: { 1: 123 },
    });

    render(<Avatars />);

    expect(
      within(screen.getByTestId('partyroom-current-dj')).getByTestId('mail-bounce-signal')
    ).toBeInTheDocument();
  });
});
