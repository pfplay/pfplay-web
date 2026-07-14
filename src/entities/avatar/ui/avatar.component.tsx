import dynamic from 'next/dynamic';
import { memo, useEffect, useRef, useState } from 'react';

const ReactionLottie = dynamic(
  () => import('@/entities/avatar/ui/reaction-lottie').then((mod) => mod.ReactionLottie),
  { ssr: false }
);
import { AvatarCompositionType, MotionType, ReactionType } from '@/shared/api/http/types/@enums';
import { AvatarFacePos } from '@/shared/api/http/types/users';
import { cn } from '@/shared/lib/functions/cn';
import ChatBubble from './chat-bubble.component';
import calculateDimensions from '../lib/calculate-dimensions';
import { Model } from '../model/avatar.model';

const MoveableFace = dynamic(
  () => import('./react-moveable/moveable-face').then((mod) => mod.MoveableFace),
  { ssr: false }
);

/** 말풍선(#410) 노출 시간 (ms). */
const CHAT_BUBBLE_DURATION = 2500;

type Props = Model & {
  height: number;
  reaction?: ReactionType;
  motionType?: MotionType;
  /**
   * 이 crew 가 마지막으로 채팅한 시각(ms). 값이 바뀌면 머리 위 말풍선(#410)을
   * CHAT_BUBBLE_DURATION 동안 노출한다. (#410)
   */
  lastChatAt?: number;
  /**
   * 함수가 있으면 얼굴 위치 조정 가능, 없으면 얼굴 위치 조정 불가능
   */
  onFacePosChange?: (facePos: AvatarFacePos) => void;
  avatarRef?: (el: HTMLElement | null, type: MotionType) => void;
};

/**
 * - 모든 아바타의 비율은 피그마 시안에 따라 3:4로 고정됩니다.
 * - facePosX, facePosY는 body 이미지 중 아바타의 얼굴이 위치할 좌표를 나타냅니다.
 *   - facePosX: face의 BODY_BASE_WIDTH 기준 x축 위치. face width 중앙까지 측정한 값
 *   - facePosY: face의 BODY_BASE_HEIGHT 기준 y축 위치. face height 상단까지 측정한 값
 * - facePosX, facePosY는 너비 120, 높이 160 기준으로 계산된 값이여야 합니다.
 * - x, y, scale는 얼굴 너비 대비 비율로 계산된 값이여야 합니다.
 */
const Avatar = memo(
  ({
    height,
    bodyUri,
    compositionType,
    faceUri,
    facePosX,
    facePosY,
    reaction,
    motionType,
    lastChatAt,
    offsetX,
    offsetY,
    scale,
    onFacePosChange,
    avatarRef,
  }: Props) => {
    const dimensions = calculateDimensions(height, facePosX, facePosY, offsetX, offsetY, scale);
    const faceImgRef = useRef<HTMLImageElement>(null);

    const ref = useRef<HTMLDivElement>(null);

    // #410: lastChatAt 가 갱신되면 말풍선을 잠시 노출. 연속 채팅이면 effect 가 재실행돼
    // 이전 타이머를 정리하고 노출 시간이 자연히 연장된다.
    const [showChatBubble, setShowChatBubble] = useState(false);
    useEffect(() => {
      if (!lastChatAt) return;
      setShowChatBubble(true);
      const timer = setTimeout(() => setShowChatBubble(false), CHAT_BUBBLE_DURATION);
      return () => clearTimeout(timer);
    }, [lastChatAt]);

    useEffect(() => {
      avatarRef?.(ref.current, motionType ?? MotionType.NONE);
    }, [motionType, avatarRef]);

    return (
      <div
        ref={ref}
        aria-label='Avatar View'
        role='presentation'
        data-testid='avatar-view'
        data-avatar-body-uri={bodyUri}
        data-avatar-face-uri={faceUri ?? ''}
        data-reaction-type={reaction ?? ''}
        data-motion-type={motionType ?? ''}
        className={cn('relative will-change-transform')}
        style={{
          width: dimensions.width,
          minWidth: dimensions.width,
          height,
          background: `url(${bodyUri}) no-repeat center center / contain`,
        }}
      >
        {reaction && (
          <div
            aria-label='Avatar Reaction'
            role='presentation'
            data-testid='avatar-reaction'
            className='absolute left-1/2 -top-6 transform -translate-x-1/2 -z-1'
          >
            <ReactionLottie reaction={reaction} />
          </div>
        )}

        {showChatBubble && (
          <div className='absolute left-1/2 -top-8 z-10 -translate-x-1/2 transform'>
            <ChatBubble />
          </div>
        )}

        {compositionType === AvatarCompositionType.BODY_WITH_FACE && faceUri && (
          <div
            className='absolute transform -translate-x-1/2 -z-1'
            style={{
              width: dimensions.faceWidth,
              height: dimensions.faceHeight,
              left: `${dimensions.facePosX}px`,
              top: `${dimensions.facePosY}px`,
            }}
          >
            <div
              className='relative w-full h-full'
              style={{ clipPath: 'ellipse(50% 50% at 50% 50%)' }}
            >
              <img
                ref={faceImgRef}
                src={faceUri}
                alt='Avatar Face'
                className='w-full h-full object-cover origin-center transition-transform'
                style={{
                  transform: `translate(${dimensions.offsetX}px, ${dimensions.offsetY}px) scale(${dimensions.zoom})`,
                }}
              />
            </div>
            {onFacePosChange && (
              <MoveableFace
                faceRef={faceImgRef}
                onFacePosChange={onFacePosChange}
                faceWidth={dimensions.faceWidth}
                faceHeight={dimensions.faceHeight}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
