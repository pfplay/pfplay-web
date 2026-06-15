import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SelectPlaylist from './select-playlist.component';

// processI18nString 은 실제 util 을 태워 '{{count}}곡' → '12곡' 보간 검증.
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: { queue: { song_count: '{{count}}곡', add_tracks_cta: '+ 곡 추가' } },
  }),
}));

const PLAYLISTS = [
  { id: 1, name: '토요일밤', musicCount: 12 },
  { id: 2, name: 'Chill', musicCount: 8 },
  { id: 3, name: 'Workout', musicCount: 0 },
];

describe('SelectPlaylist (모바일 카드 리스트)', () => {
  test('각 플레이리스트가 이름 + 곡수 카드로 렌더', () => {
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    expect(screen.getByText('토요일밤')).toBeInTheDocument();
    expect(screen.getByText('12곡')).toBeInTheDocument();
    expect(screen.getByText('Chill')).toBeInTheDocument();
    expect(screen.getByText('8곡')).toBeInTheDocument();
    expect(screen.getByText('Workout')).toBeInTheDocument();
  });

  test('musicCount > 0 카드 클릭 → onSelect 호출', async () => {
    const onSelect = vi.fn();
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={onSelect}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('mobile-playlist-card-1'));
    expect(onSelect).toHaveBeenCalledWith(PLAYLISTS[0]);
  });

  test('musicCount === 0 카드는 [+ 곡 추가] CTA + onAddTracksForEmpty 호출', async () => {
    const onAddTracksForEmpty = vi.fn();
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={vi.fn()}
        onAddTracksForEmpty={onAddTracksForEmpty}
      />
    );
    const cta = screen.getByTestId('mobile-playlist-card-3-add-tracks');
    expect(cta).toHaveTextContent('+ 곡 추가');
    await userEvent.click(cta);
    expect(onAddTracksForEmpty).toHaveBeenCalledWith(PLAYLISTS[2]);
  });

  test('musicCount === 0 카드 자체 클릭은 onSelect 호출 안 함 (선택 불가)', async () => {
    const onSelect = vi.fn();
    render(
      <SelectPlaylist
        playlists={PLAYLISTS as never}
        onSelect={onSelect}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('mobile-playlist-card-3'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
