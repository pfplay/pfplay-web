'use client';
import Image from 'next/image';
import { FC } from 'react';
import useBeAHost from '@/features/partyroom/create/lib/use-be-a-host.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';

/**
 * 모바일 로비 1컬럼 리스트 안의 "Be a PFPlay Host" 진입 카드 (이슈 #381, 옵션 B).
 *
 * - 데스크탑 `PartyroomCreateCard` 와 동일 핸들러(`useBeAHost`) 공유 — 게스트는 소셜
 *   로그인 유도, 멤버는 생성 다이얼로그.
 * - 룸 카드(BackdropBlur + 썸네일) 와 구별되는 액션 카드 폼팩터: 좌측 텍스트(red 타이틀
 *   + 부제) + 우측 plus 아이콘, full-width.
 */
const MobilePartyroomCreateCard: FC = () => {
  const t = useI18n();
  const handleClickBeAHostBtn = useBeAHost();

  return (
    <button
      type='button'
      onClick={handleClickBeAHostBtn}
      data-testid='mobile-create-partyroom-button'
      className='appearance-none w-full bg-gray-900 rounded flexRow items-center justify-between gap-3 px-5 py-4 text-start'
    >
      <div className='flexCol gap-1 min-w-0'>
        <Typography type='title2' className='text-red-300'>
          {t.lobby.title.be_a_host}
        </Typography>
        <Typography type='detail1' className='text-gray-200'>
          {t.lobby.para.freely_host}
        </Typography>
      </div>
      <Image
        src='/images/Background/bigPlus.png'
        alt='Party Room Add'
        width={44}
        height={44}
        className='shrink-0'
      />
    </button>
  );
};

export default MobilePartyroomCreateCard;
