vi.mock('@/entities/preference');
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/ui/components/dialog');

import { renderHook, act } from '@testing-library/react';
import { useUserPreferenceStore } from '@/entities/preference';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useDjingGuide from './use-djing-guide.hook';

const mockOpenDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({ dj: { title: { rule_guide: 'DJ Guide' } } });
  (useDialog as Mock).mockReturnValue({ openDialog: mockOpenDialog });
});

describe('useDjingGuide hook', () => {
  test('djingGuideHidden=false이면 showDjingGuide=true', () => {
    (useUserPreferenceStore as unknown as Mock).mockReturnValue(false);
    const { result } = renderHook(() => useDjingGuide());
    expect(result.current.showDjingGuide).toBe(true);
  });

  test('djingGuideHidden=true이면 showDjingGuide=false', () => {
    (useUserPreferenceStore as unknown as Mock).mockReturnValue(true);
    const { result } = renderHook(() => useDjingGuide());
    expect(result.current.showDjingGuide).toBe(false);
  });

  test('openDjingGuideModal이 openDialog를 호출한다', () => {
    (useUserPreferenceStore as unknown as Mock).mockReturnValue(false);
    const { result } = renderHook(() => useDjingGuide());

    act(() => {
      result.current.openDjingGuideModal();
    });

    expect(mockOpenDialog).toHaveBeenCalledWith(expect.any(Function));
  });
});
