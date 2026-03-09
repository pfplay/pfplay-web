vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ dj: { para: { empty_dj: '현재 DJ가 없습니다' } } }),
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

import React from 'react';
import { render, screen } from '@testing-library/react';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { useStores } from '@/shared/lib/store/stores.context';
import VideoTitle from './video-title.component';

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

describe('VideoTitle', () => {
  test('playback이 없으면 빈 DJ 메시지를 표시한다', () => {
    render(<VideoTitle />);
    expect(screen.getByText('현재 DJ가 없습니다')).toBeTruthy();
  });

  test('playback이 있으면 Marquee에 곡 이름을 표시한다', () => {
    store.setState({
      playback: {
        name: 'Test Song',
        id: 1,
        linkId: 'abc',
        duration: '03:00',
        thumbnailImage: '',
        endTime: 0,
      },
    });

    render(<VideoTitle />);
    expect(screen.getByTestId('marquee')).toBeTruthy();
    expect(screen.getByText('Test Song')).toBeTruthy();
  });
});
