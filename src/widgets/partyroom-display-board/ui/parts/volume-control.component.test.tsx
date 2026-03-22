import { act, fireEvent, render, screen } from '@testing-library/react';
import { useUserPreferenceStore } from '@/entities/preference';
import VolumeControl from './volume-control.component';

vi.mock('@/shared/ui/icons', () => ({
  PFVolumeOff: () => <svg data-testid='icon-volume-off' />,
  PFVolumeOn: () => <svg data-testid='icon-volume-on' />,
}));

describe('VolumeControl', () => {
  beforeEach(() => {
    useUserPreferenceStore.getState().reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const getContainer = () => screen.getByTestId('volume-control');
  const getPopup = () => screen.getByTestId('volume-popup');
  const getButton = () => screen.getByRole('button');
  const getSlider = () => screen.getByRole('slider', { hidden: true });

  describe('아이콘 렌더링', () => {
    test('기본 상태(muted=false, volume=0.5)에서 VolumeOn 아이콘을 표시한다', () => {
      render(<VolumeControl />);
      expect(screen.getByTestId('icon-volume-on')).toBeTruthy();
      expect(screen.queryByTestId('icon-volume-off')).toBeNull();
    });

    test('muted=true일 때 VolumeOff 아이콘을 표시한다', () => {
      useUserPreferenceStore.getState().setMuted(true);
      render(<VolumeControl />);
      expect(screen.getByTestId('icon-volume-off')).toBeTruthy();
      expect(screen.queryByTestId('icon-volume-on')).toBeNull();
    });

    test('volume=0일 때 VolumeOff 아이콘을 표시한다', () => {
      useUserPreferenceStore.getState().setVolume(0);
      render(<VolumeControl />);
      expect(screen.getByTestId('icon-volume-off')).toBeTruthy();
    });
  });

  describe('뮤트 토글', () => {
    test('버튼 클릭 시 음소거된다', () => {
      render(<VolumeControl />);
      fireEvent.click(getButton());
      expect(useUserPreferenceStore.getState().muted).toBe(true);
    });

    test('음소거 상태에서 버튼 클릭 시 음소거가 해제된다', () => {
      useUserPreferenceStore.getState().setMuted(true);
      render(<VolumeControl />);
      fireEvent.click(getButton());
      expect(useUserPreferenceStore.getState().muted).toBe(false);
    });
  });

  describe('슬라이더 팝업', () => {
    test('초기 상태에서 팝업은 닫혀 있다', () => {
      render(<VolumeControl />);
      expect(getPopup().getAttribute('aria-hidden')).toBe('true');
    });

    test('컨테이너에 마우스를 올리면 팝업이 열린다', () => {
      render(<VolumeControl />);
      fireEvent.mouseEnter(getContainer());
      expect(getPopup().getAttribute('aria-hidden')).toBe('false');
    });

    test('컨테이너에서 마우스가 나가면 120ms 후 팝업이 닫힌다', () => {
      render(<VolumeControl />);
      fireEvent.mouseEnter(getContainer());
      fireEvent.mouseLeave(getContainer());

      act(() => {
        vi.advanceTimersByTime(119);
      });
      expect(getPopup().getAttribute('aria-hidden')).toBe('false');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(getPopup().getAttribute('aria-hidden')).toBe('true');
    });

    test('마우스가 팝업으로 이동하면 딜레이 타이머가 취소되어 팝업이 유지된다', () => {
      render(<VolumeControl />);
      fireEvent.mouseEnter(getContainer());
      fireEvent.mouseLeave(getContainer());
      fireEvent.mouseEnter(getPopup());

      act(() => {
        vi.advanceTimersByTime(120);
      });
      expect(getPopup().getAttribute('aria-hidden')).toBe('false');
    });

    test('팝업에서 마우스가 나가면 120ms 후 팝업이 닫힌다', () => {
      render(<VolumeControl />);
      fireEvent.mouseEnter(getContainer());
      fireEvent.mouseLeave(getPopup());

      act(() => {
        vi.advanceTimersByTime(120);
      });
      expect(getPopup().getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('볼륨 조절', () => {
    test('슬라이더 값을 변경하면 volume이 업데이트된다', () => {
      render(<VolumeControl />);
      fireEvent.change(getSlider(), { target: { value: '0.8' } });
      expect(useUserPreferenceStore.getState().volume).toBeCloseTo(0.8);
    });

    test('슬라이더를 0으로 이동하면 muted가 true가 된다', () => {
      render(<VolumeControl />);
      fireEvent.change(getSlider(), { target: { value: '0' } });
      expect(useUserPreferenceStore.getState().muted).toBe(true);
    });

    test('음소거 상태에서 슬라이더를 0 초과로 이동하면 muted가 해제된다', () => {
      useUserPreferenceStore.getState().setMuted(true);
      render(<VolumeControl />);
      fireEvent.change(getSlider(), { target: { value: '0.5' } });
      expect(useUserPreferenceStore.getState().muted).toBe(false);
    });

    test('음소거 상태일 때 슬라이더는 0을 표시한다', () => {
      useUserPreferenceStore.getState().setMuted(true);
      useUserPreferenceStore.getState().setVolume(0.7);
      render(<VolumeControl />);
      expect(getSlider().value).toBe('0');
    });
  });
});
