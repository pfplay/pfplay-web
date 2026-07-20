vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/lib/store/stores.context');
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { 'data-dnd': 'attr' },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
  }),
}));
vi.mock('@/entities/music-preview', () => ({
  convertPlaylistTrackToPreview: (t: unknown) => t,
}));
vi.mock('@/entities/music-preview/index.ui', () => ({
  ThumbnailWithPreview: () => <div data-testid='thumb' />,
}));
vi.mock('@/shared/ui/components/icon-menu', () => ({
  IconMenu: () => <div data-testid='icon-menu' />,
}));
vi.mock('react-fast-marquee', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlaylistTrack } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import Track from './track.component';

const NOT_PLAYABLE = 'Not playable here (exceeds this room limit)';
const NOW_LABEL = 'NOW';
const NEXT_LABEL = 'NEXT';

const track = {
  linkId: 'l1',
  trackId: 1,
  name: 'My Song',
  duration: '6:00',
  thumbnailImage: null,
} as unknown as PlaylistTrack;

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    dj: { para: { not_playable_in_room: NOT_PLAYABLE } },
    playlist: { para: { now_playing: NOW_LABEL, next_up: NEXT_LABEL } },
  });
  (useStores as Mock).mockReturnValue({
    useUIState: (selector: (...args: any[]) => any) =>
      selector({
        cinemaView: false,
        playlistDrawer: { zIndex: 10 },
      }),
  });
});

describe('Track over-limit 배지', () => {
  test('isOverRoomLimit=true 면 not_playable 배지 텍스트를 렌더하고 행을 dim 처리한다', () => {
    const { container } = render(<Track track={track} menuItems={[]} isOverRoomLimit={true} />);

    expect(screen.getByText(NOT_PLAYABLE)).toBeInTheDocument();
    expect(container.querySelector('.opacity-50')).not.toBeNull();
  });

  test('isOverRoomLimit=false 면 배지 텍스트가 없고 dim 처리하지 않는다', () => {
    const { container } = render(<Track track={track} menuItems={[]} isOverRoomLimit={false} />);

    expect(screen.queryByText(NOT_PLAYABLE)).not.toBeInTheDocument();
    expect(container.querySelector('.opacity-50')).toBeNull();
  });

  test('isOverRoomLimit 생략 시 기존 렌더(트랙명/재생시간/DnD attr) 유지', () => {
    const { container } = render(<Track track={track} menuItems={[]} />);

    expect(screen.queryByText(NOT_PLAYABLE)).not.toBeInTheDocument();
    expect(screen.getByText('My Song')).toBeInTheDocument();
    expect(screen.getByText('6:00')).toBeInTheDocument();
    expect(container.querySelector('[data-dnd="attr"]')).not.toBeNull();
  });
});

describe('Track NOW/NEXT 배지', () => {
  test('isNow=true 면 NOW 배지 렌더', () => {
    render(<Track track={track} menuItems={[]} isNow />);
    expect(screen.getByTestId('track-badge-now')).toHaveTextContent(NOW_LABEL);
    expect(screen.queryByTestId('track-badge-next')).not.toBeInTheDocument();
  });

  test('isNext=true 면 NEXT 배지 렌더', () => {
    render(<Track track={track} menuItems={[]} isNext />);
    expect(screen.getByTestId('track-badge-next')).toHaveTextContent(NEXT_LABEL);
    expect(screen.queryByTestId('track-badge-now')).not.toBeInTheDocument();
  });

  test('배지 미지정 시 NOW/NEXT 모두 없음', () => {
    render(<Track track={track} menuItems={[]} />);
    expect(screen.queryByTestId('track-badge-now')).not.toBeInTheDocument();
    expect(screen.queryByTestId('track-badge-next')).not.toBeInTheDocument();
  });
});

describe('Track NOW/NEXT 배치 (#462)', () => {
  test('isNow=true 면 ⋮ 메뉴 대신 배지가 자리를 차지한다', () => {
    render(<Track track={track} menuItems={[]} isNow />);
    expect(screen.getByTestId('track-badge-now')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-menu')).not.toBeInTheDocument();
  });

  test('isNext=true 면 ⋮ 메뉴 대신 배지가 자리를 차지한다', () => {
    render(<Track track={track} menuItems={[]} isNext />);
    expect(screen.getByTestId('track-badge-next')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-menu')).not.toBeInTheDocument();
  });

  test('일반 곡은 ⋮ 메뉴를 그대로 보여준다', () => {
    render(<Track track={track} menuItems={[]} />);
    expect(screen.getByTestId('icon-menu')).toBeInTheDocument();
  });

  test('isNow=true 면 타이틀이 마퀴로 흐르고 이퀄라이저가 뜬다', () => {
    render(<Track track={track} menuItems={[]} isNow />);
    expect(screen.getByTestId('marquee')).toBeInTheDocument();
    expect(screen.getByTestId('playing-bars')).toBeInTheDocument();
  });

  test('isNext=true 면 마퀴도 이퀄라이저도 없다 — NOW 전용 모션', () => {
    render(<Track track={track} menuItems={[]} isNext />);
    expect(screen.queryByTestId('marquee')).not.toBeInTheDocument();
    expect(screen.queryByTestId('playing-bars')).not.toBeInTheDocument();
  });

  test('일반 곡은 마퀴 없이 제목을 그대로 렌더한다', () => {
    render(<Track track={track} menuItems={[]} />);
    expect(screen.queryByTestId('marquee')).not.toBeInTheDocument();
    expect(screen.getByText('My Song')).toBeInTheDocument();
  });
});
