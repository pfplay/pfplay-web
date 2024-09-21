import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { TwitterShareButton } from 'react-share';
import { useFetchPartyroomSummary } from '@/features/partyroom/get-summary';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { Typography } from '@/shared/ui/components/typography';
import { PFChevronRight, PFClose, PFLink, PFSettings } from '@/shared/ui/icons';

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BASE_URL
    : 'https://localhost:3000';
interface Props {
  onClose: () => void;
}
export default function PartyroomDetailPanel({ onClose }: Props) {
  const t = useI18n();
  const { openDialog } = useDialog();
  const params = useParams<{ id: string }>();
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId: Number(params.id) }, true);
  const [currentDj] = djingQueue?.djs.slice().sort((a, b) => a.orderNumber - b.orderNumber) || [];
  const { data: partyroom } = useFetchPartyroomSummary(Number(params.id));
  const currentPlayback = useStores().useCurrentPartyroom((state) => state.playback?.name);

  const handleShareBtnClick = () => {
    return openDialog(() => ({
      title: t.common.btn.share,
      titleAlign: 'center',
      showCloseIcon: true,
      classNames: {
        container: 'w-[420px] py-8 px-10 bg-gray-800',
      },
      Body: () => {
        const [isCopied, setIsCopied] = useState(false);

        const sharedUrl = `${baseUrl}/party/${params.id}`;

        const handleCopyLink = () => {
          navigator.clipboard.writeText(sharedUrl);
          setIsCopied(true);
        };

        return (
          <>
            <div className='w-[340px] flexCol gap-3'>
              <div className='w-full h-12 flexRowCenter gap-2 bg-gray-700 rounded cursor-pointer'>
                <TwitterShareButton
                  title={`I'm listening to ${partyroom?.title} room. Come hang out! Now playing ${currentPlayback} 🎶 `} // TODO: 추후 현재 재생중인 노래가 없을 때의 문구 적용
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
      },
    }));
  };

  return (
    <div className='absolute top-3 right-[108%] w-[280px] flexCol gap-6 bg-black py-7 px-5'>
      <div className='inline-flex justify-between items-center'>
        <Typography type='body3'>{t.party.title.party_info}</Typography>
        <PFClose
          width={24}
          height={24}
          onClick={onClose}
          className='[&_*]:stroke-white cursor-pointer'
        />
      </div>
      <div className='flexCol gap-2'>
        <Typography type='title2' className='line-clamp-2'>
          {partyroom?.title || ''}
        </Typography>
        <Typography type='caption1' className='text-gray-200'>
          {partyroom?.introduction || ''}
        </Typography>
      </div>
      <div className='h-[1px] w-full bg-gray-600' />
      <div className='flexCol gap-3 items-start'>
        <Typography type='body3'>{t.dj.title.current_dj}</Typography>
        <div className='w-full h-12 bg-gray-800 rounded'>
          {currentDj ? (
            <DjListItem
              userConfig={{
                username: currentDj.nickname,
                src: currentDj.avatarIconUri,
              }}
            />
          ) : (
            // TODO: 추후 i18n 적용 필요
            <Typography type='detail1'>진행 중인 디제잉이 없어요 zZz...</Typography>
          )}
        </div>
      </div>
      <div className='h-[1px] w-full bg-gray-600' />
      <div className='flex justify-between items-center'>
        <Typography type='body3'>{t.db.title.recent_dj_list}</Typography>
        <PFChevronRight width={24} height={24} />
      </div>
      <div className='flexRowCenter gap-3'>
        <Button
          onClick={handleShareBtnClick}
          size='sm'
          variant='outline'
          color='secondary'
          Icon={<PFLink />}
          className='flex-1'
        >
          {t.common.btn.share}
        </Button>
        <Button
          size='sm'
          variant='outline'
          color='secondary'
          Icon={<PFSettings />}
          className='flex-1'
        >
          {t.common.btn.settings}
        </Button>
      </div>
    </div>
  );
}
