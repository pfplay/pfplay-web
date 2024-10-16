'use client';
import { useParams } from 'next/navigation';
import { useCurrentPartyroomAlerts } from '@/entities/current-partyroom';
import { cn } from '@/shared/lib/functions/cn';
import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import { PFParty, PFChatFilled, PFPersonOutline, PFDj } from '@/shared/ui/icons';
import { PartyroomAvatars } from '@/widgets/partyroom-avatars';
import { PartyroomChatPanel } from '@/widgets/partyroom-chat-panel';
import { PartyroomDetailTrigger } from '@/widgets/partyroom-detail';
import { PartyroomDisplayBoard } from '@/widgets/partyroom-display-board';
import { DjingDialog } from '@/widgets/partyroom-djing-dialog';
import { useOpenEditProfileAvatarDialog } from '@/widgets/partyroom-edit-profile-avatar-dialog';
import { PartyroomParticipantPanel } from '@/widgets/partyroom-participant-panel';
import { Sidebar } from '@/widgets/sidebar';

const PartyroomPage = () => {
  const t = useI18n();
  const params = useParams<{ id: string }>();
  const {
    open: isDjingDialogOpen,
    onOpen: openDjingDialog,
    onClose: closeDjingDialog,
  } = useDisclosure();

  const openEditProfileAvatarDialog = useOpenEditProfileAvatarDialog();
  const { useCurrentPartyroom } = useStores();
  const crewsCount = useCurrentPartyroom((state) => state.crews.length);

  useCurrentPartyroomAlerts();

  // TODO: 파티룸 모든 api 불러오는 동안 Suspense로 입장 중 페이지 보여주기
  return (
    <>
      <PartyroomAvatars />

      {/* 가운데 전광판 */}
      <div className='absolute top-[44px] left-1/2 transform -translate-x-1/2 max-w-full w-[calc(512px+(40px*2))] px-[40px]'>
        <PartyroomDisplayBoard width={512} />
      </div>

      {/* 왼쪽 float 메뉴 */}
      <Sidebar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'absolute top-1/2 left-[40px] transform -translate-y-1/2',
        ])}
        extraButton={{
          onClick: openDjingDialog,
          icon: (size, className) => <PFDj width={size} height={size} className={className} />,
          text: t.dj.title.dj_queue,
        }}
        onClickAvatarSetting={openEditProfileAvatarDialog}
      />

      {/* 오른쪽 채팅창 */}
      <div className='absolute top-0 right-0 w-[400px] max-w-full h-screen flexCol bg-black pt-8 pb-3 px-7'>
        <div className='bg-black grid grid-cols-2 gap-3 mb-5'>
          <PartyroomDetailTrigger />
          <Button
            color='secondary'
            variant='outline'
            Icon={<PFParty widths={20} height={20} className='[&_*]:fill-gray-300' />}
            size='sm'
            className='text-gray-50'
          >
            {t.party.title.party_list}
          </Button>
        </div>

        {/* 채팅, 사람 탭 */}
        <TabGroup defaultIndex={0} className='flex-1 flexCol'>
          <TabList className={cn('flexRow')}>
            <Tab
              tabTitle={t.db.title.chat}
              variant='line'
              PrefixIcon={<PFChatFilled width={20} height={20} />}
            />
            <Tab
              tabTitle={crewsCount.toString()}
              variant='line'
              PrefixIcon={<PFPersonOutline width={20} height={20} />}
            />
          </TabList>
          <TabPanels className='flex-1 flexCol'>
            <TabPanel tabIndex={0} className='flex-1 flexCol'>
              <PartyroomChatPanel />
            </TabPanel>
            <TabPanel tabIndex={1} className='flex-1 flexCol'>
              <PartyroomParticipantPanel />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>

      <DjingDialog
        partyroomId={Number(params.id)}
        open={isDjingDialogOpen}
        close={closeDjingDialog}
      />
    </>
  );
};

export default PartyroomPage;
