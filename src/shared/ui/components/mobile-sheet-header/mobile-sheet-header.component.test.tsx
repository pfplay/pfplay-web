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

  test('대칭 스페이서: header 직계 자식에 w-10 div가 정확히 2개', () => {
    const { container } = render(
      <MobileSheetHeader leading={<button>L</button>} title='제목' trailing={<button>R</button>} />
    );
    expect(container.querySelectorAll('header > div.w-10').length).toBe(2);
  });

  test('titleId prop이 title 엘리먼트 id에 연결된다', () => {
    render(<MobileSheetHeader title='T' titleId='x' />);
    expect(screen.getByText('T').id).toBe('x');
  });

  test('title은 h2 헤딩 엘리먼트로 렌더된다', () => {
    render(<MobileSheetHeader title='제목' />);
    expect(screen.getByRole('heading', { level: 2, name: '제목' })).toBeTruthy();
    expect(screen.getByText('제목').tagName).toBe('H2');
  });
});
