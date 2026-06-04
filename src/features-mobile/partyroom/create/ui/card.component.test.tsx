import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MobilePartyroomCreateCard from './card.component';

const beAHostMock = vi.fn();
vi.mock('@/features/partyroom/create/lib/use-be-a-host.hook', () => ({
  default: () => beAHostMock,
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    lobby: {
      title: { be_a_host: 'Be a PFPlay Host' },
      para: { freely_host: '원하는 테마의 파티를 자유롭게 호스트 해보세요!' },
    },
  }),
}));

vi.mock('next/image', () => ({ __esModule: true, default: () => <img alt='' /> }));

describe('MobilePartyroomCreateCard', () => {
  beforeEach(() => {
    beAHostMock.mockReset();
  });

  test('be_a_host 타이틀 + 부제 렌더', () => {
    render(<MobilePartyroomCreateCard />);
    expect(screen.getByText('Be a PFPlay Host')).toBeInTheDocument();
    expect(screen.getByText('원하는 테마의 파티를 자유롭게 호스트 해보세요!')).toBeInTheDocument();
  });

  test('클릭 → useBeAHost 핸들러 호출', () => {
    render(<MobilePartyroomCreateCard />);
    fireEvent.click(screen.getByTestId('mobile-create-partyroom-button'));
    expect(beAHostMock).toHaveBeenCalledTimes(1);
  });
});
