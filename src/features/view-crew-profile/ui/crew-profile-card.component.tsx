'use client';

import Avatar from '@/entities/avatar/ui/avatar.component';
import { ActivityType, AvatarCompositionType } from '@/shared/api/http/types/@enums';
import { Typography } from '@/shared/ui/components/typography';
import { useViewCrewProfile } from '../api/use-view-crew-profile.query';

type Props = {
  crewId: number;
};

/**
 * 다른 crew 프로필 카드(#409) — 다이얼로그 Body 로 렌더. 아바타·닉네임·소개 +
 * DJ 점수(좋은 아바타를 입은 사람의 점수가 궁금하다는 요구). 아바타는 entities/avatar 의
 * Avatar 를 재사용(프로필 응답엔 offset/scale 이 없어 기본값으로 렌더).
 */
export default function CrewProfileCard({ crewId }: Props) {
  const { data, isLoading } = useViewCrewProfile(crewId);

  if (isLoading || !data) {
    return (
      <div className='flex min-h-[200px] min-w-[240px] items-center justify-center'>
        <Typography type='detail1' className='text-gray-400'>
          불러오는 중...
        </Typography>
      </div>
    );
  }

  const djScore =
    data.activitySummaries.find((summary) => summary.activityType === ActivityType.DJ_PNT)?.score ??
    0;

  return (
    <div className='flex min-w-[240px] flex-col items-center gap-3 px-2 py-1'>
      <Avatar
        height={120}
        bodyUri={data.avatarBodyUri}
        faceUri={data.avatarFaceUri}
        compositionType={
          data.avatarFaceUri
            ? AvatarCompositionType.BODY_WITH_FACE
            : AvatarCompositionType.SINGLE_BODY
        }
        facePosX={data.combinePositionX}
        facePosY={data.combinePositionY}
        offsetX={0}
        offsetY={0}
        scale={1}
      />

      <Typography type='body1' className='font-bold text-gray-50'>
        {data.nickname}
      </Typography>

      {data.introduction && (
        <Typography type='detail1' className='whitespace-pre-line text-center text-gray-400'>
          {data.introduction}
        </Typography>
      )}

      <div className='mt-1 flex items-center gap-2 rounded bg-gray-800 px-3 py-1.5'>
        <Typography type='detail1' className='text-gray-400'>
          DJ 점수
        </Typography>
        <Typography type='body1' className='font-bold text-red-300'>
          {djScore}p
        </Typography>
      </div>
    </div>
  );
}
