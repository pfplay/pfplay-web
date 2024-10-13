'use client';
import {
  AvatarBodyList,
  AvatarEditDone,
  AvatarFaceList,
  SelectedAvatar,
  SelectedAvatarStateProvider,
} from '@/features/edit-profile-avatar';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BackButton } from '@/shared/ui/components/back-button';
import { Button } from '@/shared/ui/components/button';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';

export default function AvatarSettingsPage() {
  const t = useI18n();

  return (
    <div className='absolute-user-form-section'>
      <div className='h-full flexRow justify-start max-w-screen-desktop mx-auto gap-5 p-10 px-[60px]'>
        <SelectedAvatarStateProvider>
          <div className='flexCol items-start gap-10'>
            <BackButton text={t.settings.para.what_wear} />
            <SelectedAvatar />
          </div>
          <div className='flex-1 h-full flexCol'>
            <TabGroup className='flex-1 flexCol'>
              <TabList className='w-full flexRow'>
                <Tab tabTitle='body' variant='line' />
                <Tab tabTitle='face' variant='line' />
                <div className='flex-1 border-b-[1px] border-b-gray-400' />
              </TabList>
              <TabPanels className='flex-1 flexCol pb-2 overflow-hidden'>
                {/* FIXME: 각 패널 overflow auto 안 먹고 있음 */}
                <TabPanel tabIndex={0} className='flex-1 flexCol pt-6'>
                  <AvatarBodyList />
                </TabPanel>
                <TabPanel tabIndex={1} className='flex-1 flexCol pt-4'>
                  <AvatarFaceList />
                </TabPanel>
              </TabPanels>
            </TabGroup>

            <AvatarEditDone>
              {({ done, canSubmit, loading }) => (
                <Button
                  onClick={done}
                  disabled={!canSubmit}
                  loading={loading}
                  className='self-end px-[88.5px] shrink-0'
                  size='xl'
                >
                  Let&apos;s get in
                </Button>
              )}
            </AvatarEditDone>
          </div>
        </SelectedAvatarStateProvider>
      </div>
    </div>
  );
}
