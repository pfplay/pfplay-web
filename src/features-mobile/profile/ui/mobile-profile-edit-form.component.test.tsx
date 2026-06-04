import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MobileProfileEditForm from './mobile-profile-edit-form.component';

const onSubmitMock = vi.fn((e) => e?.preventDefault?.());
vi.mock('@/features/edit-profile-bio', () => ({
  useEditProfileBioForm: () => ({
    control: {} as any,
    onSubmit: onSubmitMock,
    errors: {},
    btnDisabled: false,
    isPending: false,
  }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    settings: { title: { nickname: '닉네임', introduction: '소개', who_r_u: 'Who R U' } },
    common: { ec: { char_limit_12: '12자', char_limit_50: '50자' } },
  }),
}));
// Controller 는 control 의존 — 얕게 mock 해 render prop 만 호출
vi.mock('react-hook-form', () => ({
  Controller: ({ render }: any) =>
    render({ field: { value: '', onChange: () => {}, onBlur: () => {}, name: '', ref: () => {} } }),
}));

describe('MobileProfileEditForm', () => {
  beforeEach(() => onSubmitMock.mockClear());

  test('닉네임·소개 필드 + CTA 렌더', () => {
    render(<MobileProfileEditForm />);
    expect(screen.getByText('닉네임')).toBeInTheDocument();
    expect(screen.getByText('소개')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-profile-submit')).toBeInTheDocument();
  });

  test('제출 시 onSubmit 호출', () => {
    render(<MobileProfileEditForm />);
    fireEvent.submit(screen.getByTestId('mobile-profile-form'));
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
