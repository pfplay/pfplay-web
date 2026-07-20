import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import PlaylistDetailSheet from './playlist-detail-sheet.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        playlist_tracks_empty: '아직 곡이 없어요',
        add_tracks_cta: '+ 곡 추가',
        sheet_add_tracks_title: '곡 추가',
      },
    },
    playlist: { para: { now_playing: 'NOW', next_up: 'NEXT' } },
  }),
}));

let storeState: { me?: { crewId: number }; currentDj?: { crewId: number } } = {};
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: (s: typeof storeState) => unknown) => selector(storeState),
  }),
}));

const useFetchPlaylistTracksMock = vi.fn();
vi.mock('@/features/playlist/list-tracks/api/use-fetch-playlist-tracks.query', () => ({
  useFetchPlaylistTracks: (id: number) => useFetchPlaylistTracksMock(id),
}));
const removeTrackMock = vi.fn();
vi.mock('@/features/playlist/remove-track/api/use-remove-playlist-track.mutation', () => ({
  useRemovePlaylistTrack: () => ({ mutate: removeTrackMock, isPending: false }),
}));
const pushMock = vi.fn();
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  useFullscreenSheet: () => ({ push: pushMock, pop: vi.fn() }),
}));
// AddTracksSheet 는 push node 로만 쓰이므로 stub
vi.mock('./add-tracks-sheet.component', () => ({ default: () => null }));
vi.mock('react-fast-marquee', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));

const PL = { id: 7, name: 'A', musicCount: 2, type: PlaylistType.PLAYLIST, orderNumber: 1 };
const TRACK = {
  trackId: 11,
  linkId: 'v1',
  name: '곡1',
  orderNumber: 1,
  duration: '3:00',
  thumbnailImage: 'https://t',
};

describe('PlaylistDetailSheet', () => {
  beforeEach(() => {
    removeTrackMock.mockReset();
    pushMock.mockReset();
    storeState = {};
  });

  test('곡 목록 렌더', () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.getByText('곡1')).toBeInTheDocument();
  });

  test('곡 [×] → removeTrack.mutate({ playlistId, trackId }) (confirm 없음)', async () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    await userEvent.click(screen.getByTestId('detail-track-remove-11'));
    expect(removeTrackMock).toHaveBeenCalledWith({ playlistId: 7, trackId: 11 });
  });

  test('[+ 곡 추가] → add-tracks sheet push (playlistId 전달)', async () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    await userEvent.click(screen.getByTestId('detail-add-tracks'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'add-tracks', title: '곡 추가' })
    );
  });

  test('empty → 안내 + [+ 곡 추가] CTA', () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.getByText('아직 곡이 없어요')).toBeInTheDocument();
    expect(screen.getByTestId('detail-add-tracks')).toBeInTheDocument();
  });

  test('곡 제거 버튼은 PFClose 아이콘(svg) 렌더', () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.getByTestId('detail-track-remove-11').querySelector('svg')).toBeTruthy();
  });

  test('커서=11 + 내가 CurrentDJ → NOW 배지', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 5 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.getByTestId('track-badge-now')).toHaveTextContent('NOW');
  });

  test('커서=11 + 내가 CurrentDJ 아님 → NOW 없음, NEXT(wrap=11)만', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 9 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.queryByTestId('track-badge-now')).not.toBeInTheDocument();
    expect(screen.getByTestId('track-badge-next')).toHaveTextContent('NEXT');
  });
});

describe('모바일 시트 커서 배치 (#462)', () => {
  beforeEach(() => {
    storeState = {};
  });

  test('NOW 곡도 삭제 버튼을 유지한다 — 배지가 ✕ 를 밀어내지 않는다', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 5 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);

    expect(screen.getByTestId('track-badge-now')).toBeInTheDocument();
    expect(screen.getByTestId('detail-track-remove-11')).toBeInTheDocument();
  });

  test('NOW 곡에 마퀴와 이퀄라이저가 붙는다', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 5 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);

    expect(screen.getByTestId('marquee')).toBeInTheDocument();
    expect(screen.getByTestId('playing-bars')).toBeInTheDocument();
  });

  test('NEXT 곡에는 모션이 없다', () => {
    storeState = { me: { crewId: 5 }, currentDj: { crewId: 9 } };
    useFetchPlaylistTracksMock.mockReturnValue({
      data: { content: [TRACK], lastPlayedTrackId: 11 },
    });
    render(<PlaylistDetailSheet playlist={PL as never} />);

    expect(screen.getByTestId('track-badge-next')).toBeInTheDocument();
    expect(screen.queryByTestId('playing-bars')).not.toBeInTheDocument();
    expect(screen.queryByTestId('marquee')).not.toBeInTheDocument();
  });
});
