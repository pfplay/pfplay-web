import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GradeType } from '@/shared/api/http/types/@enums';
import AuthorityHeadset from './authority-headset.component';

vi.mock('@/shared/ui/icons', () => ({
  PFHeadsetGray: (props: any) => <svg data-testid='headset-gray' {...props} />,
  PFHeadsetRed: (props: any) => <svg data-testid='headset-red' {...props} />,
}));

describe('mobile AuthorityHeadset', () => {
  test('LISTENER 는 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<AuthorityHeadset grade={GradeType.LISTENER} />);
    expect(container.innerHTML).toBe('');
  });
  test('CLUBBER 는 회색 헤드셋', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.CLUBBER} />);
    expect(getByTestId('headset-gray')).toBeTruthy();
  });
  test('MODERATOR 는 빨간 헤드셋', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.MODERATOR} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });
  test('HOST 는 빨간 헤드셋', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.HOST} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });
});
