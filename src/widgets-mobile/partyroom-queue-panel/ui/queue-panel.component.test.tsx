import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuthorityTier, QueueStatus } from '@/shared/api/http/types/@enums';
import QueuePanel from './queue-panel.component';

// GuestCta 가 useInformSocialType 호출 (회귀 fix #383 으로 dialog 패턴 적용).
// 이 hook 이 react-query QueryClient 의존이라 test 환경에서 throw → 게스트 분기 케이스 보호.
vi.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: () => vi.fn(),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        guest_cta_title: '🎧 음악을 직접 틀어보세요',
        guest_cta_subtitle: '3초만에 가입 →',
        member_action_register: '+ DJ 등록',
        member_action_unregister: '큐에서 나가기',
        member_action_change_playlist: '변경',
        member_action_manage_playlists: '내 플레이리스트 관리',
        current_dj_title: '현재 DJ',
        empty: '큐 비어있음',
        my_position: '내 순서 {{position}}번째 · 총 {{total}}명',
      },
    },
  }),
}));

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
vi.mock('@/features-mobile/playlist/manage', () => ({
  useOpenPlaylistsManagement: () => vi.fn(),
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
    // 게스트는 MemberActions(= 플리 관리 진입점) 자체가 안 보임
    expect(screen.queryByTestId('member-action-manage-playlists')).not.toBeInTheDocument();
  });

  test('멤버 + 빈 큐 → 등록 버튼만', () => {
    setIsGuest(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: { djs: [], playback: undefined, queueStatus: QueueStatus.OPEN },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.getByTestId('member-action-register')).toBeInTheDocument();
    // 멤버는 플리 관리 진입점 노출
    expect(screen.getByTestId('member-action-manage-playlists')).toBeInTheDocument();
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
    // 큐에 없는 멤버 → 내 순서 요약 미표시
    expect(screen.queryByTestId('queue-position-summary')).not.toBeInTheDocument();
  });

  test('멤버 + 본인 큐 있음 → MemberActions = [큐에서 나가기] + 내 순서 요약', () => {
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
    // 정렬 순번 2번째 / 총 2명 (현재 DJ 아님)
    expect(screen.getByTestId('queue-position-summary')).toHaveTextContent(
      '내 순서 2번째 · 총 2명'
    );
  });

  test('멤버 + 본인이 현재 DJ → 순서 요약 바 미노출 (CurrentDjRow 가 이미 보여줘 중복)', () => {
    setIsGuest(false);
    useFetchDjingQueueMock.mockReturnValue({
      data: {
        djs: [
          { crewId: 99, nickname: 'Me', playlistName: 'mine', orderNumber: 0 },
          { crewId: 1, nickname: 'A', playlistName: 'p1', orderNumber: 1 },
        ],
        playback: { name: 'X', duration: '3:00' },
        queueStatus: QueueStatus.OPEN,
      },
    });
    useCurrentPartyroomMock.mockReturnValue(99);
    render(<QueuePanel partyroomId={1} />);
    expect(screen.queryByTestId('queue-position-summary')).not.toBeInTheDocument();
  });
});
