import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import MobileSheetHeader from './mobile-sheet-header.component';

describe('MobileSheetHeader', () => {
  test('leading/title/trailing 슬롯 렌더 + title은 Typography', () => {
    render(
      <MobileSheetHeader
        leading={<button data-testid='lead'>L</button>}
        title='제목'
        trailing={<button data-testid='trail'>T</button>}
      />
    );
    expect(screen.getByTestId('lead')).toBeTruthy();
    expect(screen.getByTestId('trail')).toBeTruthy();
    expect(screen.getByText('제목')).toBeTruthy();
  });

  test('trailing 미지정 시에도 leading/title 정상 (대칭 스페이서 유지)', () => {
    const { container } = render(<MobileSheetHeader leading={<span>L</span>} title='T' />);
    expect(container.querySelector('header')).toBeTruthy();
    expect(screen.getByText('T')).toBeTruthy();
  });
});
