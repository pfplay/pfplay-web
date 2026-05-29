import { FC } from 'react';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

/**
 * ▾/◂ 토글. controlled (state owner = MobilePartyroomDisplayBoard, spec §4.4).
 *
 * a11y (spec §6.2): aria-label expanded → '영상 가리기' / collapsed → '영상 펼치기',
 * aria-pressed: !expanded, min-h/w 44px.
 *
 * **positioning 책임은 parent (Chunk 3 VideoFrame).** 본문에 absolute / top-x / right-x
 * 등을 두면 leaf 가 부모 layout 에 coupling 됨. 시각 styling 도 최소.
 */
const ExpandToggle: FC<Props> = ({ expanded, onToggle }) => {
  return (
    <button
      type='button'
      aria-label={expanded ? '영상 가리기' : '영상 펼치기'}
      aria-pressed={!expanded}
      onClick={onToggle}
      className='min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-200'
    >
      {expanded ? '▾' : '◂'}
    </button>
  );
};

export default ExpandToggle;
