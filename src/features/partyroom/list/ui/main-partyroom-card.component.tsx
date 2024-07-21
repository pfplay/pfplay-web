'use client';
import Image from 'next/image';
import Link from 'next/link';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BackdropBlurContainer } from '@/shared/ui/components/backdrop-blur-container';
import { Typography } from '@/shared/ui/components/typography';
import Members from './members.component';
import { useSuspenseFetchMainPartyroom } from '../api/use-fetch-main-partyroom.query';

export default function MainPartyroomCard() {
  const t = useI18n();
  const { data: partyroom } = useSuspenseFetchMainPartyroom();

  if (!partyroom) {
    log('Main partyroom not found. something went wrong.');
    return null; // 메인 파티룸은 항상 존재한다고 가정하지만, 최소한의 안전장치.
  }
  return (
    <BackdropBlurContainer>
      <Link
        href={`/parties/${partyroom.partyroomId}`}
        className='flexCol tablet:flexRow items-start tablet:items-end gap-[20px] tablet:gap-[50px] desktop:gap-[169px] px-7 py-10 backdrop-blur-xl bg-backdrop-black/80'
      >
        <div className='flexCol gap-6 tablet:gap-12 pb-[21px]'>
          <div className='gap-3 flexCol'>
            <Typography type='title2' className='text-white'>
              {t.lobby.para.pfplay_main_stage}
            </Typography>
            <Typography type='detail1' className='text-gray-200'>
              {t.lobby.para.welcome_party}
            </Typography>
          </div>
          <Members
            count={partyroom.memberCount}
            icons={partyroom.primaryIcons.map((avatar) => avatar.avatarIconUri)}
          />
        </div>

        {partyroom.playback && (
          <div className='flex-1 max-w-full min-w-0 flexRow pt-4 border-t border-gray-700'>
            <div className='flexRow gap-[12px] items-center max-w-full'>
              <div className='w-[80px] h-[44px] bg-gray-700'>
                <Image
                  priority
                  src={partyroom.playback.thumbnailImage}
                  alt={'playback thumbnail'}
                  width={80}
                  height={44}
                  className={'w-full h-full object-contain select-none'}
                />
              </div>
              <Typography
                type='caption1'
                overflow='ellipsis'
                className='flex-1 select-none text-gray-50'
              >
                {partyroom.playback.name}
              </Typography>
            </div>
          </div>
        )}
      </Link>
    </BackdropBlurContainer>
  );
}

const logger = withDebugger(0);
const log = logger(errorLog);
