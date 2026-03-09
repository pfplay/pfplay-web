vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/icons', () => ({
  PFClose: (props: any) => <svg data-testid='close-icon' {...props} />,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import PanelHeader from './panel-header.component';

beforeEach(() => {
  (useI18n as Mock).mockReturnValue({
    party: { para: { party_rooms: 'Party Rooms' } },
  });
});

describe('PanelHeader (party-list)', () => {
  test('타이틀을 렌더링한다', () => {
    render(<PanelHeader onClose={vi.fn()} />);
    expect(screen.getByText('Party Rooms')).toBeTruthy();
  });

  test('닫기 아이콘을 클릭하면 onClose를 호출한다', () => {
    const onClose = vi.fn();
    render(<PanelHeader onClose={onClose} />);
    fireEvent.click(screen.getByTestId('close-icon'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
