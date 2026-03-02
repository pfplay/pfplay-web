import { forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import Tooltip from './tooltip.component';

jest.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/shared/lib/hooks/use-portal-root.hook', () => ({
  __esModule: true,
  default: () => document.body,
}));

jest.mock('@/shared/lib/functions/repeat-animation-frame', () => ({
  repeatAnimationFrame: (fn: () => void) => {
    fn();
    return () => {
      /* cleanup */
    };
  },
}));

// Tooltip uses cloneElement with ref — child must accept ref
const Child = forwardRef<HTMLButtonElement>((_, ref) => <button ref={ref}>대상</button>);
Child.displayName = 'Child';

describe('Tooltip', () => {
  test('visible=true일 때 title이 렌더링된다', () => {
    render(
      <Tooltip title='도움말 텍스트' visible>
        <Child />
      </Tooltip>
    );

    expect(screen.getByText('도움말 텍스트')).toBeTruthy();
  });

  test('visible=false일 때도 DOM에는 존재하지만 opacity-0 클래스가 적용된다', () => {
    render(
      <Tooltip title='숨겨진 텍스트' visible={false}>
        <Child />
      </Tooltip>
    );

    expect(screen.getByText('숨겨진 텍스트')).toBeTruthy();
    // Portal renders to document.body, not render container
    const tooltipDiv = document.body.querySelector('.opacity-0');
    expect(tooltipDiv).not.toBeNull();
  });

  test('children이 렌더링된다', () => {
    render(
      <Tooltip title='텍스트' visible>
        <Child />
      </Tooltip>
    );

    expect(screen.getByText('대상')).toBeTruthy();
  });
});
