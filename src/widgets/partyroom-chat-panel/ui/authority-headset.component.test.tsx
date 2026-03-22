import React from 'react';
import { render } from '@testing-library/react';
import { GradeType } from '@/shared/api/http/types/@enums';
import AuthorityHeadset from './authority-headset.component';

vi.mock('@/shared/ui/icons', () => ({
  PFHeadsetGray: (props: any) => <svg data-testid='headset-gray' {...props} />,
  PFHeadsetRed: (props: any) => <svg data-testid='headset-red' {...props} />,
}));

describe('AuthorityHeadset', () => {
  test('LISTENER는 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<AuthorityHeadset grade={GradeType.LISTENER} />);
    expect(container.innerHTML).toBe('');
  });

  test('CLUBBER는 회색 헤드셋을 렌더링한다', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.CLUBBER} />);
    expect(getByTestId('headset-gray')).toBeTruthy();
  });

  test('HOST는 빨간 헤드셋을 렌더링한다', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.HOST} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });

  test('MODERATOR는 빨간 헤드셋을 렌더링한다', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.MODERATOR} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });

  test('COMMUNITY_MANAGER는 빨간 헤드셋을 렌더링한다', () => {
    const { getByTestId } = render(<AuthorityHeadset grade={GradeType.COMMUNITY_MANAGER} />);
    expect(getByTestId('headset-red')).toBeTruthy();
  });
});
