import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import MaintenancePage from './page';

vi.mock('./refresh-button', () => ({
  default: () => <button data-testid='refresh-button'>refresh</button>,
}));

describe('MaintenancePage', () => {
  test('searchParams 가 비어있으면 default 한국어/영어 fallback 메시지를 렌더', () => {
    render(<MaintenancePage searchParams={{}} />);
    expect(screen.getByText('시스템 점검 중')).toBeInTheDocument();
    expect(
      screen.getByText(/더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다/)
    ).toBeInTheDocument();
    expect(screen.getByText(/We are performing scheduled maintenance/)).toBeInTheDocument();
  });

  test('searchParams 에 messageKo / messageEn 이 있으면 그대로 렌더', () => {
    render(
      <MaintenancePage
        searchParams={{
          messageKo: '한글 메시지',
          messageEn: 'english message',
        }}
      />
    );
    expect(screen.getByText('한글 메시지')).toBeInTheDocument();
    expect(screen.getByText('english message')).toBeInTheDocument();
  });

  test('RefreshButton 이 마운트된다', () => {
    render(<MaintenancePage searchParams={{}} />);
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
  });
});
