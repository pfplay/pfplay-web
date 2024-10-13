import Image from 'next/image';
import { useState } from 'react';
import { TwitterShareButton } from 'react-share';
import { PartyroomDetailSummary } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function useOpenShareDialog(partyroomSummary?: PartyroomDetailSummary) {
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
      Body: () => <Body partyroom={partyroomSummary} />,
    }));
  };
}

function Body({ partyroom }: { partyroom?: PartyroomDetailSummary }) {
  if (!partyroom?.title) {
    throw new Error('partyroom summary is not found.');
  }

  const [playback] = useStores().useCurrentPartyroom((state) => [state.playback]);
  const [isCopied, setIsCopied] = useState(false);

  const t = useI18n();

  if (partyroom?.linkDomain === 'undefined') {
    throw new Error('Partyroom domain is not found. maybe you are not in the partyroom.');
  }

  // 개발환경에서는 브라우저 주소창에 사용하는 localhost를 붙이고 나머지 path 입력해서 테스트. e.g) https://localhost:3000/party/...
  const sharedUrl = `https://pfplay.io/party/${partyroom.linkDomain}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setIsCopied(true);
  };

  const refinedSentence =
    t.party.para.share_x_partyroom.replace('{partyroom_name}', partyroom.title) +
    `${playback?.name ? ` Now playing {${playback.name}} 🎶` : ''}`;

  return (
    <>
      <div className='w-[340px] flexCol gap-3'>
        <div className='w-full h-12 flexRowCenter gap-2 bg-gray-700 rounded cursor-pointer'>
          <TwitterShareButton
            title={refinedSentence}
            related={['@pfplay_music']}
            url={`@pfplay_music #pfplay ${sharedUrl}`}
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
            {isCopied ? t.party.para.copy_completed : t.party.btn.copy_link}
          </Button>
        </div>
      </div>
    </>
  );
}
