import Image from 'next/image';
import { useState } from 'react';
import { TwitterShareButton } from 'react-share';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function useOpenShareDialog(partyroomTitle: string) {
  const t = useI18n();
  const { openDialog } = useDialog();

  return () => {
    return openDialog(() => ({
      title: t.common.btn.share,
      titleAlign: 'center',
      showCloseIcon: true,
      classNames: {
        container: 'w-[420px] py-8 px-10 bg-gray-800',
      },
      Body: () => <Body partyroomTitle={partyroomTitle} />,
    }));
  };
}

function Body({ partyroomTitle }: { partyroomTitle: string }) {
  const [id, playback] = useStores().useCurrentPartyroom((state) => [state.id, state.playback]);
  if (typeof id === 'undefined') {
    throw new Error('partyroomId is not found. maybe you are not in the partyroom.');
  }

  const t = useI18n();
  const sharedUrl = `https://pfplay.io/party/${id}`;

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setIsCopied(true);
  };

  return (
    <>
      <div className='w-[340px] flexCol gap-3'>
        <div className='w-full h-12 flexRowCenter gap-2 bg-gray-700 rounded cursor-pointer'>
          <TwitterShareButton
            title={`I'm listening to ${partyroomTitle} room. Come hang out! Now playing ${playback?.name} 🎶 `} // TODO: 추후 현재 재생중인 노래가 없을 때의 문구 적용
            related={['@pfplay_music']}
            url={`@pfplay_music ${sharedUrl}`}
            className='w-full h-12 flexRowCenter gap-2 bg-gray-700 rounded cursor-pointer'
          >
            <Image src={'/images/ETC/twitter.png'} alt='twitter' width={24} height={24} />
            {t.party.btn.share_twitter}
          </TwitterShareButton>
        </div>

        <div className='flex justify-between items-center gap-3'>
          <div className='w-[245px] h-12 py-3 pl-3 pr-6 flexRowCenter gap-2 bg-gray-700 rounded'>
            <Typography type='body3' overflow='ellipsis'>
              {sharedUrl}
            </Typography>
          </div>
          <Button
            size='lg'
            variant='outline'
            color='secondary'
            className='w-[83px]'
            onClick={handleCopyLink}
          >
            {/* 추후 i18n (en) Copy/Copied!로 변경 되면 btn text overflow 되는 ui defect 사라짐 */}
            {isCopied ? t.party.para.copy_completed : t.party.btn.copy_link}
          </Button>
        </div>
      </div>
    </>
  );
}
