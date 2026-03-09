vi.mock('@/features/partyroom/list-crews', () => ({
  useCurrentPartyroomCrews: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('./parts/all-crews-panel.component', () => ({
  __esModule: true,
  default: () => <div data-testid='all-crews-panel' />,
}));
vi.mock('./parts/restriction-panel.component', () => ({
  __esModule: true,
  default: () => <div data-testid='restriction-panel' />,
}));

import { render, screen } from '@testing-library/react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import PartyroomCrewsPanel from './partyroom-crews-panel.component';

beforeEach(() => {
  vi.clearAllMocks();
  (useCurrentPartyroomCrews as Mock).mockReturnValue([{ crewId: 1 }, { crewId: 2 }, { crewId: 3 }]);
  (useI18n as Mock).mockReturnValue({
    crews: {
      title: {
        all_count: 'All ({count})',
        restriction: 'Restrictions',
      },
    },
  });
});

describe('PartyroomCrewsPanel', () => {
  test('크루 수와 탭 타이틀을 렌더링한다', () => {
    render(<PartyroomCrewsPanel />);
    expect(screen.getByText('All (03)')).toBeTruthy();
    expect(screen.getByText('Restrictions')).toBeTruthy();
  });

  test('기본 탭에서 AllCrewsPanel을 렌더링한다', () => {
    render(<PartyroomCrewsPanel />);
    expect(screen.getByTestId('all-crews-panel')).toBeTruthy();
  });
});
