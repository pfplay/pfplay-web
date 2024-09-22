import { useParams } from 'next/navigation';
import { useFetchPartyroomSummary } from '@/features/partyroom/get-summary';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { Typography } from '@/shared/ui/components/typography';
import { PFChevronRight, PFClose, PFLink, PFSettings } from '@/shared/ui/icons';
import useOpenShareDialog from './use-open-share-dialog.hook';

interface Props {
  onClose: () => void;
}
export default function PartyroomDetailPanel({ onClose }: Props) {
  const t = useI18n();
  const params = useParams<{ id: string }>();

  const { data: djingQueue } = useFetchDjingQueue({ partyroomId: Number(params.id) }, true);
  const currentDj = djingQueue?.djs.slice().sort((a, b) => a.orderNumber - b.orderNumber)[0];

  const { data: partyroomSummary } = useFetchPartyroomSummary(Number(params.id));
  const openShareDialog = useOpenShareDialog(partyroomSummary?.title ?? '');

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
          {partyroomSummary?.title || ''}
        </Typography>
        <Typography type='caption1' className='text-gray-200'>
          {partyroomSummary?.introduction || ''}
        </Typography>
      </div>

      <Divider />

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

      <Divider />

      <div className='flex justify-between items-center'>
        <Typography type='body3'>{t.db.title.recent_dj_list}</Typography>
        <PFChevronRight width={24} height={24} />
      </div>
      <div className='flexRowCenter gap-3'>
        <Button
          onClick={openShareDialog}
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

function Divider() {
  return <div className='h-[1px] w-full bg-gray-600' />;
}
