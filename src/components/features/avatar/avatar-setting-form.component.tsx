import { Fragment, PropsWithChildren } from 'react';
import SuspenseWithErrorBoundary from '@/shared/api/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';
import { BackButton } from '@/shared/ui/components/back-button';
import { ButtonLink } from '@/shared/ui/components/button-link';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@/shared/ui/components/tab';
import AvatarBodyList from './avatar-body-list.component';
import AvatarFaceList from './avatar-face-list.component';
import SelectedAvatar from './selected-avatar.component';

interface Props {
  withLayout?: boolean;
}

const AvatarSettingForm = ({ withLayout }: Props) => {
  const Container = withLayout ? Layout : Fragment;

  return (
    <Container>
      <div className='flexRow gap-5'>
        <div className='flexCol items-start gap-10'>
          <BackButton text='뭘 입고 놀아볼까요?' />
          <SelectedAvatar />
        </div>
        <div className='w-full flexCol'>
          <TabGroup>
            <TabList className={cn('w-full flexRow')}>
              <Tab tabTitle='body' variant='line' />
              <Tab tabTitle='face' variant='line' />
              <div className='flex-1 border-b-[1px] border-b-gray-400' />
            </TabList>
            <TabPanels className={'pb-2'}>
              <TabPanel tabIndex={0} className='pt-6'>
                <SuspenseWithErrorBoundary>
                  <AvatarBodyList />
                </SuspenseWithErrorBoundary>
              </TabPanel>
              <TabPanel tabIndex={1} className={' pt-4 '}>
                <AvatarFaceList />
              </TabPanel>
            </TabPanels>
          </TabGroup>

          <ButtonLink
            href='/parties'
            linkTitle="Let's get in"
            classNames={{
              container: 'self-end',
              button: 'px-[88.5px]',
            }}
            size='xl'
          />
        </div>
      </div>
    </Container>
  );
};

function Layout({ children }: PropsWithChildren) {
  return (
    <div className='absolute-user-form-section'>
      <div className='h-full flexCol justify-start max-w-screen-desktop mx-auto gap-10 p-10 px-[60px]'>
        {children}
      </div>
    </div>
  );
}

export default AvatarSettingForm;