import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { ReactionType } from '@/shared/api/http/types/@enums';
import dislikeAnimation from './dislike.json';
import grabAnimation from './grab.json';
import likeAnimation from './like.json';

export default function ReactionLottie({ reaction }: { reaction: ReactionType }) {
  const [isVisible, setIsVisible] = useState(true);

  // 리액션이 변경되면 다시 보여줌
  useEffect(() => {
    setIsVisible(true);
  }, [reaction]);

  // 애니메이션이 끝나면 숨김
  if (!isVisible) return null;
  return (
    <Lottie
      animationData={lottieDict[reaction]}
      loop={false}
      onComplete={() => setIsVisible(false)}
    />
  );
}

const lottieDict: Record<ReactionType, unknown> = {
  [ReactionType.LIKE]: likeAnimation,
  [ReactionType.DISLIKE]: dislikeAnimation,
  [ReactionType.GRAB]: grabAnimation,
};
