vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ ed: { para: { empty_notice: '공지가 없습니다' } } }),
}));
vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({
  galmuriFont: { className: 'font-galmuri' },
}));
vi.mock('@/shared/ui/icons', () => ({
  PFCampaign: (props: any) => <svg data-testid='campaign-icon' {...props} />,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { useStores } from '@/shared/lib/store/stores.context';
import Notice from './notice.component';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('Notice', () => {
  test('공지가 없으면 빈 메시지를 표시한다', () => {
    render(<Notice />);
    expect(screen.getByText('공지가 없습니다')).toBeTruthy();
  });

  test('공지가 있으면 Marquee에 공지 내용을 표시한다', () => {
    store.setState({ notice: '환영합니다!' });

    render(<Notice />);
    expect(screen.getByTestId('marquee')).toBeTruthy();
    expect(screen.getByText('환영합니다!')).toBeTruthy();
  });

  test('캠페인 아이콘이 항상 표시된다', () => {
    render(<Notice />);
    expect(screen.getByTestId('campaign-icon')).toBeTruthy();
  });
});
