vi.mock('@/shared/lib/localization/i18n.context');

import '@/shared/api/__test__/msw-server';
import { waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import useFetchPlaylists from './use-fetch-playlists.query';

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    playlist: { title: { grabbed_song: 'Grabbed Songs' } },
  });
});

describe('useFetchPlaylists 통합', () => {
  test('플레이리스트 목록을 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchPlaylists());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }),
      ])
    );
  });

  test('GRABLIST 타입의 이름을 로컬라이즈된 텍스트로 덮어쓴다', async () => {
    const { result } = renderWithClient(() => useFetchPlaylists());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const grablist = result.current.data?.find((p) => p.type === PlaylistType.GRABLIST);
    if (grablist) {
      expect(grablist.name).toBe('Grabbed Songs');
    }
  });
});
