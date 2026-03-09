import '@/shared/api/__test__/msw-server';
import { waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useFetchGeneralPartyrooms } from './use-fetch-general-partyrooms.query';
import useFetchPartyroomDetailSummary from '../../get-summary/api/use-fetch-partyroom-detail-summary.query';

describe('useFetchGeneralPartyrooms 통합', () => {
  test('GENERAL 타입의 파티룸만 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchGeneralPartyrooms());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // 핸들러가 MAIN 타입만 반환하므로 GENERAL 필터링 결과는 빈 배열
    expect(result.current.data).toEqual([]);
  });
});

describe('useFetchPartyroomDetailSummary 통합', () => {
  test('partyroomId로 상세 정보를 조회한다', async () => {
    const { result } = renderWithClient(() => useFetchPartyroomDetailSummary(1, true));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveProperty('title', 'Main Stage');
    expect(result.current.data).toHaveProperty('linkDomain', 'main-stage');
  });

  test('enabled=false이면 쿼리가 실행되지 않는다', () => {
    const { result } = renderWithClient(() => useFetchPartyroomDetailSummary(1, false));
    expect(result.current.fetchStatus).toBe('idle');
  });
});
