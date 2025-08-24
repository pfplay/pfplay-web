'use client';

import { useState } from 'react';

type PreviewOverlayProps = {
  /** 현재 재생중인지 여부 */
  isPlaying: boolean;
  /** 재생 시작 콜백 */
  onPlay: () => void;
  /** 재생 중단 콜백 */
  onStop: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
};

/**
 * 썸네일 위에 호버 시 표시되는 재생/중단 버튼
 * 호버 시에만 표시되고, 재생 상태에 따라 버튼이 변경됨
 */
export default function PreviewOverlay({
  isPlaying,
  onPlay,
  onStop,
  className,
}: PreviewOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
  };

  return (
    <div
      className={`absolute inset-0 cursor-pointer ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* 호버 시에만 표시되는 재생/중단 버튼 */}
      {isHovered && (
        <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-200'>
          {/* 작은 흰색 원 with 검정 아이콘 */}
          <div className='w-6 h-6 bg-white rounded-full flex items-center justify-center'>
            {isPlaying ? (
              /* 중단 아이콘: 검정 두 세로 막대 */
              <div className='flex gap-0.5'>
                <div className='w-0.5 h-2 bg-black'></div>
                <div className='w-0.5 h-2 bg-black'></div>
              </div>
            ) : (
              /* 재생 아이콘: 검정 삼각형 */
              <div
                className='ml-0.5'
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid black',
                  borderTop: '3px solid transparent',
                  borderBottom: '3px solid transparent',
                }}
              ></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
