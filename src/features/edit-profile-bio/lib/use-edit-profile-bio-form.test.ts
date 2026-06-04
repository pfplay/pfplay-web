import { renderHook, act } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useEditProfileBioForm } from './use-edit-profile-bio-form';

const updateBioMock = vi.fn();
vi.mock('../api/use-update-my-bio.mutation', () => ({
  useUpdateMyBio: () => ({ mutate: updateBioMock, isPending: false }),
}));
vi.mock('@/entities/me', () => ({
  useSuspenseFetchMe: () => ({ data: { nickname: 'olddata', introduction: 'hi' } }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: {
      ec: { char_field_required: 'required', char_limit_12: 'max12', char_limit_50: 'max50' },
    },
    settings: { para: { nickname_taken: '이미 사용 중인 닉네임' } },
  }),
}));

describe('useEditProfileBioForm', () => {
  beforeEach(() => updateBioMock.mockReset());

  test('onSubmit 시 me 기본값으로 updateBio 호출', async () => {
    const { result } = renderHook(() => useEditProfileBioForm());
    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as any);
    });
    expect(updateBioMock).toHaveBeenCalledTimes(1);
    expect(updateBioMock.mock.calls[0][0]).toEqual({ nickname: 'olddata', introduction: 'hi' });
  });

  test('409 응답 시 nickname 에러 셋팅', async () => {
    const { result } = renderHook(() => useEditProfileBioForm());
    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as any);
    });
    expect(updateBioMock).toHaveBeenCalledTimes(1);
    const opts = updateBioMock.mock.calls[0][1];
    expect(opts?.onError).toBeTypeOf('function');
    act(() => opts.onError({ response: { data: { code: 409 } } }));
    expect(result.current.errors.nickname?.message).toBe('이미 사용 중인 닉네임');
  });
});
