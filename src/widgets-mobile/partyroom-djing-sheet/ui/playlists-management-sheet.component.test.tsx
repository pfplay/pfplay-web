import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import PlaylistsManagementSheet from './playlists-management-sheet.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        playlists_empty: '아직 플레이리스트가 없어요',
        create_playlist_cta: '+ 새 플레이리스트',
        create_playlist_placeholder: '플레이리스트 이름',
        create_playlist_submit: '추가',
      },
    },
    playlist: { para: { delete_playlist_confirm: '이 플레이리스트를 삭제할까요?' } },
    common: { btn: { cancel: '취소', delete: '삭제' } },
  }),
}));

const useFetchPlaylistsMock = vi.fn();
vi.mock('@/features/playlist/list', () => ({
  useFetchPlaylists: () => useFetchPlaylistsMock(),
}));
const createMutateMock = vi.fn();
vi.mock('@/features/playlist/add/api/use-create-playlist.mutation', () => ({
  useCreatePlaylist: () => ({ mutate: createMutateMock, isPending: false }),
}));
const removeMutateMock = vi.fn();
vi.mock('@/features/playlist/remove/api/use-remove-playlist.mutation', () => ({
  useRemovePlaylist: () => ({ mutate: removeMutateMock, isPending: false }),
}));
const pushMock = vi.fn();
const confirmMock = vi.fn();
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  useFullscreenSheet: () => ({ push: pushMock, pop: vi.fn() }),
}));
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({ openConfirmDialog: (...a: unknown[]) => confirmMock(...a) }),
}));
// PlaylistDetailSheet 는 push node 로만 쓰이므로 stub
vi.mock('./playlist-detail-sheet.component', () => ({ default: () => null }));

const NORMAL = { id: 1, name: 'A', musicCount: 5, type: PlaylistType.PLAYLIST, orderNumber: 1 };
const GRAB = { id: 2, name: 'Grab', musicCount: 3, type: PlaylistType.GRABLIST, orderNumber: 0 };

describe('PlaylistsManagementSheet', () => {
  beforeEach(() => {
    createMutateMock.mockReset();
    removeMutateMock.mockReset();
    pushMock.mockReset();
    confirmMock.mockReset();
  });

  test('플리 목록 렌더 (이름 + 곡 수)', () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL, GRAB] });
    render(<PlaylistsManagementSheet />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Grab')).toBeInTheDocument();
  });

  test('GRABLIST 카드 → 삭제 버튼 미렌더', () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL, GRAB] });
    render(<PlaylistsManagementSheet />);
    expect(screen.getByTestId('manage-playlist-delete-1')).toBeInTheDocument();
    expect(screen.queryByTestId('manage-playlist-delete-2')).not.toBeInTheDocument();
  });

  test('일반 플리 삭제 → confirm → removePlaylist.mutate([id])', async () => {
    confirmMock.mockResolvedValue(true);
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-playlist-delete-1'));
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(removeMutateMock).toHaveBeenCalledWith([1]);
  });

  test('삭제 confirm 취소 시 mutate 안 함', async () => {
    confirmMock.mockResolvedValue(false);
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-playlist-delete-1'));
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(removeMutateMock).not.toHaveBeenCalled();
  });

  test('생성 form: CTA → input → 제출 시 createPlaylist.mutate({name})', async () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-create-cta'));
    await userEvent.type(screen.getByTestId('manage-create-input'), '새 플리');
    await userEvent.click(screen.getByTestId('manage-create-submit'));
    expect(createMutateMock).toHaveBeenCalledWith(
      { name: '새 플리' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  test('빈 이름 제출 막기 (mutate 안 함)', async () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-create-cta'));
    await userEvent.click(screen.getByTestId('manage-create-submit'));
    expect(createMutateMock).not.toHaveBeenCalled();
  });

  test('카드 클릭 → playlist-detail-${id} sheet push', async () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-playlist-card-1'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'playlist-detail-1', title: 'A' })
    );
  });

  test('empty 상태 → 안내 + 생성 CTA', () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [] });
    render(<PlaylistsManagementSheet />);
    expect(screen.getByText('아직 플레이리스트가 없어요')).toBeInTheDocument();
    expect(screen.getByTestId('manage-create-cta')).toBeInTheDocument();
  });
});
