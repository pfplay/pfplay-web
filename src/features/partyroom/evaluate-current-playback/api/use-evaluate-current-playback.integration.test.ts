vi.mock('@/shared/lib/store/stores.context');

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useStores } from '@/shared/lib/store/stores.context';
import { useEvaluateCurrentPlayback } from './use-evaluate-current-playback.mutation';

beforeEach(() => {
  vi.clearAllMocks();
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
});

describe('useEvaluateCurrentPlayback 통합', () => {
  test('LIKE 반응 성공 시 결과를 반환한다', async () => {
    const { result } = renderWithClient(() => useEvaluateCurrentPlayback());

    await act(async () => {
      result.current.mutate('LIKE' as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      isLiked: true,
      isDisliked: false,
      isGrabbed: false,
    });
  });

  test('partyroomId가 없으면 에러를 던진다', async () => {
    (useStores as Mock).mockReturnValue({
      useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: undefined }),
    });

    const { result } = renderWithClient(() => useEvaluateCurrentPlayback());

    await act(async () => {
      result.current.mutate('LIKE' as any);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
