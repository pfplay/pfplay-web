'use client';
import {
  AvatarBodyList,
  AvatarEditDone,
  AvatarFaceList,
  SelectedAvatar,
  SelectedAvatarStateProvider,
} from '@/features/edit-profile-avatar';
import { cn } from '@/shared/lib/functions/cn';
import { BackButton } from '@/shared/ui/components/back-button';
import { Button } from '@/shared/ui/components/button';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';

const AvatarSettingsPage = () => {
  return (
    <div className='absolute-user-form-section'>
      <div className='h-full flexRow justify-start max-w-screen-desktop mx-auto gap-5 p-10 px-[60px]'>
        <SelectedAvatarStateProvider>
          <div className='flexCol items-start gap-10'>
            <BackButton text='뭘 입고 놀아볼까요?' />
            <SelectedAvatar />
          </div>
          <div className='w-full h-full flexCol'>
            <TabGroup>
              <TabList className={cn('w-full flexRow')}>
                <Tab tabTitle='body' variant='line' />
                <Tab tabTitle='face' variant='line' />
                <div className='flex-1 border-b-[1px] border-b-gray-400' />
              </TabList>
              <TabPanels className='flex-1 flexCol pb-2 overflow-hidden'>
                <TabPanel tabIndex={0} className='flex-1 flexCol pt-6 overflow-hidden'>
                  <AvatarBodyList />
                </TabPanel>
                <TabPanel tabIndex={1} className='flex-1 flexCol pt-4 overflow-hidden'>
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
                  className='self-end px-[88.5px]'
                  size='xl'
                >
                  {`Let's get in`}
                </Button>
              )}
            </AvatarEditDone>
          </div>
        </SelectedAvatarStateProvider>
      </div>
    </div>
  );
};

export default AvatarSettingsPage;
