'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import Crews from '@/features/partyroom/list/ui/crews.component';
import { getPartyroomCardBackdropProps } from '@/features/partyroom/list/ui/partyroom-card-backdrop';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BackdropBlurContainer } from '@/shared/ui/components/backdrop-blur-container';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  roomId: number;
  summary: PartyroomSummary;
  onClose?: () => void;
  /** Main 카드일 때 true → "PFPlay Main Stage" 라벨 표시 */
  isMain?: boolean;
}

/**
 * Main 라벨 sub-컴포넌트.
 *
 * isMain=true 분기에서만 마운트 → `useI18n` 호출이 라벨 케이스에 한정.
 * 일반 카드 (isMain=false) 는 이 컴포넌트를 마운트하지 않으므로 i18n provider 의존 X.
 * (기존 v1 카드 단위 test 들이 i18n mock 없이 통과하는 invariant 보존.)
 */
const MainStageLabel: FC = () => {
  const t = useI18n();
  return (
    <Typography type='caption2' className='text-gray-300 uppercase tracking-wide'>
      {t.lobby.para.pfplay_main_stage}
    </Typography>
  );
};

/**
 * 모바일 로비 1컬럼 카드 (chunk 5 = 데스크탑 baseline catch-up).
 *
 * - 데스크탑 PartyroomCard 와 동일한 BackdropBlur 단일 카드 패턴, 모바일 폼팩터로 축소.
 * - shared 컴포넌트 (BackdropBlurContainer, Typography, Crews) 차용.
 * - PFInfoOutline 은 모바일에서 의도적으로 제외 (정보 기능 없는 정적 아이콘).
 * - isMain=true 일 때 title2 위 caption2 chip 으로 "PFPlay Main Stage" 라벨 (MainStageLabel sub-컴포넌트로 분리).
 */
const MobilePartyroomCard: FC<Props> = ({ roomId, summary, onClose, isMain }) => {
  return (
    <BackdropBlurContainer
      src={summary.playback?.thumbnailImage}
      {...getPartyroomCardBackdropProps(summary.playback?.thumbnailImage)}
    >
      <Link
        href={`/parties/${roomId}?source=list`}
        onClick={onClose}
        className='h-full flexCol justify-between gap-10 py-5 px-5 backdrop-blur-sm bg-backdrop-black/80'
      >
        <div className='flexCol gap-1.5'>
          {isMain && <MainStageLabel />}
          <Typography type='title2' className='text-gray-50'>
            {summary.title}
          </Typography>
        </div>

        <div className='gap-3 flexCol max-w-full'>
          {summary.playback && (
            <div className='flex-1 max-w-full min-w-0 flexRowCenter gap-3 rounded'>
              <div className='w-[64px] h-[36px] bg-gray-700 shrink-0'>
                <Image
                  priority
                  src={summary.playback.thumbnailImage}
                  alt='playback thumbnail'
                  width={64}
                  height={36}
                  className='w-full h-full object-contain select-none'
                />
              </div>
              <Typography
                type='caption1'
                overflow='ellipsis'
                className='flex-1 text-gray-50 select-none'
              >
                {summary.playback.name}
              </Typography>
            </div>
          )}
          <div className='bg-gray-600 h-[1px]' />
          <Crews
            count={summary.crewCount}
            icons={summary.primaryIcons.map((a) => a.avatarIconUri)}
          />
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default MobilePartyroomCard;
