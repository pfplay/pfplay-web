import { useRef, useState } from 'react';

const DEFAULT_HIDE_DELAY_MS = 120;

/**
 * 마우스 hover/leave 이벤트에 딜레이를 적용해 팝업 열림/닫힘 상태를 관리하는 훅.
 *
 * hover zone이 두 개 이상일 때 (trigger + popup) 사이의 미세한 gap에서
 * hover가 끊기지 않도록 짧은 딜레이로 타이머를 취소할 시간을 확보한다.
 *
 * @param hideDelay - mouseLeave 후 닫힘 지연 시간(ms). 기본값 120
 */
export function useHoverPopup(hideDelay = DEFAULT_HIDE_DELAY_MS) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), hideDelay);
  };

  return { open, show, hide };
}
