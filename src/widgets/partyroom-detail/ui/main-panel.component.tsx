import { useParams } from 'next/navigation';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { Loading } from '@/shared/ui/components/loading';
import { Typography } from '@/shared/ui/components/typography';
import { PFChevronRight, PFLink, PFSettings } from '@/shared/ui/icons';
import useOpenShareDialog from './use-open-share-dialog.hook';
import { Panel, usePanelController } from '../lib/panel-controller.context';

export default function MainPanel() {
  const t = useI18n();
  const params = useParams<{ id: string }>();
  const { goTo } = usePanelController();

  const { data: djingQueue, isLoading: isDjingQueueLoading } = useFetchDjingQueue(
    { partyroomId: Number(params.id) },
    !!params.id
  );
  const { data: partyroomSummary, isLoading: isPartyroomSummaryLoading } =
    useFetchPartyroomDetailSummary(Number(params.id), !!params.id);

  const isLoading = isDjingQueueLoading || isPartyroomSummaryLoading;

  const currentDj = djingQueue?.djs.slice().sort((a, b) => a.orderNumber - b.orderNumber)[0];

  const openShareDialog = useOpenShareDialog(partyroomSummary);

  if (isLoading) {
    return (
      <div className='h-[343px] flex justify-center items-center'>
        <Loading />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 mt-6'>
      <div className='flexCol gap-2'>
        <Typography type='title2' className='line-clamp-2'>
          {partyroomSummary?.title || 'Unknown Title'}
        </Typography>
        {partyroomSummary?.introduction && (
          <Typography type='caption1' className='text-gray-200'>
            {partyroomSummary?.introduction}
          </Typography>
        )}
      </div>

      <Divider />

      <div className='flexCol gap-3 items-start'>
        <Typography type='body3'>{t.dj.title.current_dj}</Typography>
        <div className='w-full h-12 bg-gray-800 rounded flex justify-start items-center '>
          {currentDj ? (
            <DjListItem
              userConfig={{
                username: currentDj.nickname,
                src: currentDj.avatarIconUri,
              }}
            />
          ) : (
            // TODO: 추후 i18n 적용 필요
            <Typography type='detail1' className='pl-4 my-auto'>
              진행 중인 디제잉이 없어요 zZz...
            </Typography>
          )}
        </div>
      </div>

      <Divider />

      <div
        role='button'
        tabIndex={0}
        className='flex justify-between items-center'
        onClick={() => {
          goTo(Panel.PlaybackHistory);
        }}
      >
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
