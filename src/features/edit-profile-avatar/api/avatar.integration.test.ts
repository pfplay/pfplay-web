import '@/shared/api/__test__/msw-server';
import { waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useFetchAvatarBodies } from './use-fetch-avatar-bodies.query';
import { useFetchAvatarFaces } from './use-fetch-avatar-faces.query';

describe('useFetchAvatarBodies 통합', () => {
  test('아바타 바디 목록을 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchAvatarBodies());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toHaveProperty('name', 'Body A');
  });
});

describe('useFetchAvatarFaces 통합', () => {
  test('아바타 페이스 목록을 반환한다', async () => {
    const { result } = renderWithClient(() => useFetchAvatarFaces());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toHaveProperty('name', 'Face A');
  });
});
