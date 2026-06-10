import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SelectPlaylistSheet from './select-playlist-sheet.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: {
      btn: {
        cancel: '취소',
      },
    },
    // 자식 SelectPlaylist 도 동일 provider 사용 → song_count·add_tracks_cta 포함.
    partyroom: {
      queue: {
        song_count: '{{count}}곡',
        add_tracks_cta: '+ 곡 추가',
        sheet_select_confirm: '선택 완료',
      },
    },
  }),
}));

const PL = [{ id: 1, name: 'A', musicCount: 5 }];

describe('SelectPlaylistSheet', () => {
  test('SelectPlaylist 카드 리스트 + 푸터 [취소][선택 완료]', () => {
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByTestId('select-playlist-cancel')).toHaveTextContent('취소');
    expect(screen.getByTestId('select-playlist-confirm')).toHaveTextContent('선택 완료');
  });

  test('카드 선택 후 [선택 완료] 클릭 시 onConfirm(playlist)', async () => {
    const onConfirm = vi.fn();
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('mobile-playlist-card-1'));
    await userEvent.click(screen.getByTestId('select-playlist-confirm'));
    expect(onConfirm).toHaveBeenCalledWith(PL[0]);
  });

  test('선택 없이 [선택 완료] 클릭 시 disabled (호출 안 됨)', async () => {
    const onConfirm = vi.fn();
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    expect(screen.getByTestId('select-playlist-confirm')).toBeDisabled();
    await userEvent.click(screen.getByTestId('select-playlist-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('[취소] 클릭 시 onCancel 호출', async () => {
    const onCancel = vi.fn();
    render(
      <SelectPlaylistSheet
        playlists={PL as never}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        onAddTracksForEmpty={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('select-playlist-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
