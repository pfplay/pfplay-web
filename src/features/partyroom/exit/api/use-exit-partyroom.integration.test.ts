/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
jest.mock('@/entities/current-partyroom', () => ({
  useRemoveCurrentPartyroomCaches: () => mockRemoveCaches,
}));

const mockRemoveCaches = jest.fn();

import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useExitPartyroom } from './use-exit-partyroom.mutation';

const API = process.env.NEXT_PUBLIC_API_HOST_NAME;

beforeEach(() => jest.clearAllMocks());

describe('useExitPartyroom 통합', () => {
  test('성공 시 removeCurrentPartyroomCaches를 호출한다', async () => {
    const { result } = renderWithClient(() => useExitPartyroom());

    await act(async () => {
      result.current.mutate({ partyroomId: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRemoveCaches).toHaveBeenCalledTimes(1);
  });

  test('API 에러 시 isError가 true가 된다', async () => {
    server.use(
      http.post(`${API}v1/partyrooms/:id/exit`, () =>
        HttpResponse.json(
          { errorCode: ErrorCode.ACTIVE_ANOTHER_ROOM, reason: 'error' },
          { status: 400 }
        )
      )
    );

    const { result } = renderWithClient(() => useExitPartyroom());

    await act(async () => {
      result.current.mutate({ partyroomId: 1 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockRemoveCaches).not.toHaveBeenCalled();
  });
});
