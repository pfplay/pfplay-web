/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
jest.mock('@/shared/lib/store/stores.context');

import '@/shared/api/__test__/msw-server';
import { waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useStores } from '@/shared/lib/store/stores.context';
import useFetchDjingQueue from './use-fetch-djing-queue.query';
import useFetchPlaybackHistory from '../../list-playback-histories/api/use-fetch-playback-histories.query';

beforeEach(() => {
  jest.clearAllMocks();
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
});

describe('useFetchDjingQueue 통합', () => {
  test('DJ 대기열 정보를 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchDjingQueue({ partyroomId: 1 }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveProperty('queueStatus', 'OPEN');
    expect(result.current.data?.djs).toHaveLength(2);
  });

  test('enabled=false이면 쿼리가 실행되지 않는다', () => {
    const { result } = renderWithClient(() => useFetchDjingQueue({ partyroomId: 1 }, false));
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useFetchPlaybackHistory 통합', () => {
  test('재생 이력을 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchPlaybackHistory());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toHaveProperty('musicName', 'Song A');
  });
});
