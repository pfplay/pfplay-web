import {
  useRef,
  ReactElement,
  CSSProperties,
  cloneElement,
  useState,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { DomId } from '@/constants/dom-id';
import { cn } from '@/shared/lib/cn';
import { repeatAnimationFrame } from '@/shared/lib/repeat-animation-frame';
import Typography from '@/shared/ui/components/typography/typography.component';

interface Position extends Pick<CSSProperties, 'top' | 'left'> {
  ready: boolean;
}

type TooltipColor = 'red' | 'gray';
interface TooltipProps {
  children: ReactElement;
  title: string;
  visible: boolean;
  color?: TooltipColor;
  spacing?: number;
}

/**
 * @description children 이 function component 일 경우 forwardedRef 가 적용되어 있어야 합니다.
 */
const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  visible,
  color = 'red',
  spacing = 13,
}) => {
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    ready: false,
  });
  const tooltipRoot = useRef<HTMLElement>(document.getElementById(DomId.TooltipRoot)).current;
  const childRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    function updatePosition() {
      repeatAnimationFrame(() => {
        const childNode = childRef.current;
        const tooltipNode = tooltipRef.current;
        if (!childNode || !tooltipNode) return;

        const childRect = childNode.getBoundingClientRect();
        const tooltipRect = tooltipNode.getBoundingClientRect();
        const centerOffset = childRect.width / 2 - tooltipRect.width / 2;

        setPosition({
          top: childRect.bottom + window.scrollY + spacing,
          left: childRect.left + window.scrollX + centerOffset,
          ready: true,
        });
      }, 10);
    }

    updatePosition();
  }, [visible]);

  if (!tooltipRoot) {
    throw new Error(`Cannot find tooltip root element.`);
  }
  return (
    <>
      {cloneElement(children, { ref: childRef })}

      {createPortal(
        <div
          ref={tooltipRef}
          className={cn([
            'absolute z-tooltip py-[8px] px-[20px] rounded-[4px]',
            colorsDict[color],

            'will-change-[opacity] transition-opacity duration-200',
            {
              'opacity-0': !(visible && position.ready),
              'opacity-1': visible && position.ready,
            },

            /* arrow */
            'before:content-[""] before:absolute before:-z-1',
            'before:top-[1px] before:left-1/2 before:-translate-x-1/2 before:-translate-y-full',
            'before:w-[8px] before:h-[8px] before:polygon-equilateral-triangle',
          ])}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <Typography type='caption1'>{title}</Typography>
        </div>,
        tooltipRoot
      )}
    </>
  );
};

const colorsDict: Record<TooltipColor, string> = {
  red: 'text-gray-50 bg-red-500 before:bg-red-500',
  gray: 'text-gray-50 bg-gray-700 before:bg-gray-700',
};

export default Tooltip;
