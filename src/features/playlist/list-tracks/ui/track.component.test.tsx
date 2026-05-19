vi.mock('@/shared/lib/localization/i18n.context');
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
import Track from './track.component';

const NOT_PLAYABLE = 'Not playable here (exceeds this room limit)';

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
