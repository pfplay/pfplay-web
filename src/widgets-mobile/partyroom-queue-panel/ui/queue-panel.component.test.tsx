import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuthorityTier, QueueStatus } from '@/shared/api/http/types/@enums';
import QueuePanel from './queue-panel.component';

const useFetchMeMock = vi.fn();
vi.mock('@/entities/me', () => ({ useFetchMe: () => useFetchMeMock() }));

const setIsGuest = (isGuest: boolean) =>
  useFetchMeMock.mockReturnValue({
    data: { authorityTier: isGuest ? AuthorityTier.GT : AuthorityTier.FM },
  });

const useFetchDjingQueueMock = vi.fn();
vi.mock('@/features/partyroom/list-djing-queue', () => ({
  useFetchDjingQueue: () => useFetchDjingQueueMock(),
}));

vi.mock('@/features/playlist/list', () => ({
  useFetchPlaylists: () => ({ data: [] }),
}));

const useCurrentPartyroomMock = vi.fn();
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: (s: { me?: { crewId: number } }) => unknown) =>
      useCurrentPartyroomMock(selector),
  }),
}));

vi.mock('@/features-mobile/partyroom/register-me-to-queue', () => ({
  useMobileRegisterMeToQueue: () => vi.fn(),
}));
vi.mock('@/features-mobile/partyroom/change-my-playlist', () => ({
  useMobileChangeMyPlaylist: () => vi.fn(),
}));
vi.mock('@/features-mobile/partyroom/unregister-me-from-queue', () => ({
  useMobileUnregisterMeFromQueue: () => vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('MobilePartyroomQueuePanel (분기 매트릭스)', () => {
  test('게스트 → GuestCta + 큐 리스트', () => {
    setIsGuest(true);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [{ crewId: 1, nickname: 'A', playlistName: 'p', orderNumber: 0 }],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(undefined);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('guest-cta')).toBeInTheDocument();
  });

  test('멤버 + 빈 큐 → 등록 버튼만', () => {
    setIsGuest(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: { djs: [], playback: undefined, queueStatus: QueueStatus.OPEN },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('member-action-register')).toBeInTheDocument();
  });

  test('멤버 + 큐 있음 → CurrentDjRow + QueueList + MemberActions(register)', () => {
    setIsGuest(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 1, nickname: 'A', playlistName: 'p1', orderNumber: 0 },
          { crewId: 2, nickname: 'B', playlistName: 'p2', orderNumber: 1 },
        ],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByText(/A/)).toBeInTheDocument();
    expect(screen.getByText(/X/)).toBeInTheDocument();
    expect(screen.getByText(/B/)).toBeInTheDocument();
    expect(screen.getByTestId('member-action-register')).toBeInTheDocument();
  });

  test('멤버 + 본인 큐 있음 → MemberActions = [큐에서 나가기]', () => {
    setIsGuest(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 1, nickname: 'A', playlistName: 'p1', orderNumber: 0 },
          { crewId: 99, nickname: 'Me', playlistName: 'mine', orderNumber: 1 },
        ],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('member-action-unregister')).toBeInTheDocument();
  });
});
