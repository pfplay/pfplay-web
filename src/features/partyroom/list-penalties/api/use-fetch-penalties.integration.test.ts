vi.mock('@/shared/lib/store/stores.context');
vi.mock('./use-can-view-penalties.hook');

import '@/shared/api/__test__/msw-server';
import { waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useStores } from '@/shared/lib/store/stores.context';
import canViewPenalties from './use-can-view-penalties.hook';
import useFetchPenalties from './use-fetch-penalties.query';

beforeEach(() => {
  vi.clearAllMocks();
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
  (canViewPenalties as Mock).mockReturnValue(true);
});

describe('useFetchPenalties 통합', () => {
  test('패널티 목록을 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchPenalties());

    // initialData가 []이므로 실제 fetch 완료까지 대기
    await waitFor(() => expect(result.current.data?.length).toBeGreaterThan(0));
    expect(result.current.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ penaltyId: expect.any(Number) })])
    );
  });

  test('canView가 false이면 쿼리가 실행되지 않는다', async () => {
    (canViewPenalties as Mock).mockReturnValue(false);

    const { result } = renderWithClient(() => useFetchPenalties());

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    // initialData가 []이므로 data는 빈 배열
    expect(result.current.data).toEqual([]);
  });
});
