import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import useOpenPlaylistsManagement from './use-open-playlists-management.hook';

const pushMock = vi.fn();
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  useFullscreenSheet: () => ({ push: pushMock, pop: vi.fn() }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: { queue: { sheet_playlists_management_title: '내 플레이리스트' } },
  }),
}));
vi.mock('@/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component', () => ({
  default: () => null,
}));

describe('useOpenPlaylistsManagement', () => {
  test('호출 시 key=playlists-management sheet 를 push', () => {
    const { result } = renderHook(() => useOpenPlaylistsManagement());
    result.current();
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'playlists-management', title: '내 플레이리스트' })
    );
  });
});
