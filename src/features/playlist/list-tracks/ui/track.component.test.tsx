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

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlaylistTrack } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import Track from './track.component';

const NOT_PLAYABLE = 'Not playable here (exceeds this room limit)';
const NOW_LABEL = 'Now';
const NEXT_LABEL = 'Next';

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
