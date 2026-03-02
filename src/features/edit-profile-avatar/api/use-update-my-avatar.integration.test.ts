/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
jest.mock('@/entities/wallet/lib/use-is-nft.hook');

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import useIsNft from '@/entities/wallet/lib/use-is-nft.hook';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { ObtainmentType } from '@/shared/api/http/types/@enums';
import { AvatarBody } from '@/shared/api/http/types/users';
import { useUpdateMyAvatar } from './use-update-my-avatar.mutation';

const singleBody: AvatarBody = {
  id: 1,
  name: 'Body A',
  resourceUri: 'https://example.com/body-a.png',
  available: true,
  obtainableType: ObtainmentType.BASIC,
  obtainableScore: 0,
  combinable: false,
  defaultSetting: true,
};

const combinableBody: AvatarBody = {
  id: 2,
  name: 'Body B',
  resourceUri: 'https://example.com/body-b.png',
  available: true,
  obtainableType: ObtainmentType.BASIC,
  obtainableScore: 0,
  combinable: true,
  defaultSetting: false,
  combinePositionX: 0.5,
  combinePositionY: 0.3,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useIsNft as jest.Mock).mockReturnValue(() => false);
});

describe('useUpdateMyAvatar 통합', () => {
  test('non-combinable body → SINGLE_BODY로 업데이트 성공', async () => {
    const { result, queryClient } = renderWithClient(() => useUpdateMyAvatar());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({ body: singleBody });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.Me],
    });
  });

  test('combinable body + face → BODY_WITH_FACE로 업데이트 성공', async () => {
    const { result } = renderWithClient(() => useUpdateMyAvatar());

    await act(async () => {
      result.current.mutate({
        body: combinableBody,
        faceUri: 'https://example.com/face.png',
        facePos: { offsetX: 0.5, offsetY: 0.3, scale: 1 },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  test('combinable body에 faceUri 없으면 에러', async () => {
    const { result } = renderWithClient(() => useUpdateMyAvatar());

    await act(async () => {
      result.current.mutate({ body: combinableBody });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('faceUri and facePos are required');
  });
});
