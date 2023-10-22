'use client';
import Image from 'next/image';
import React, { FC, Fragment, PropsWithChildren, useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { AvatarParts } from '@/api/@types/Avatar';
import { AvatarService } from '@/api/services/Avatar';
import AvatarBodyList from '@/components/features/Avatar/AvatarBodyList';
import AvatarFaceList from '@/components/features/Avatar/AvatarFaceList';
import BackButton from '@/components/shared/BackButton';
import CustomLink from '@/components/shared/CustomLink';
import CustomTab from '@/components/shared/atoms/CustomTab';
import { mockAvatarPartsList } from '@/constants/__mock__/mockAvatarPartsList';
import { useDialog } from '@/hooks/useDialog';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/routes';

interface Props {
  withLayout?: boolean;
}

const AvatarSettingForm: FC<Props> = ({ withLayout }) => {
  const { openErrorDialog } = useDialog();
  const [bodyList, setBodyList] = useState<AvatarParts[]>([]);
  const [faceList, setFaceList] = useState<AvatarParts[]>([]);
  const [selectedBody, setSelectedBody] = useState<AvatarParts>();
  const [selectedFace, setSelectedFace] = useState<AvatarParts>();
  const Container = withLayout ? Layout : Fragment;

  const fetchBodyList = async () => {
    try {
      const bodyList = await AvatarService.getBodyList();
      setBodyList(bodyList);
      setSelectedBody(bodyList[0]);
    } catch (e) {
      openErrorDialog(e);
    }
  };

  const fetchFaceList = async () => {
    try {
      // TODO: fetch face list
      setFaceList(mockAvatarPartsList);
      setSelectedFace(mockAvatarPartsList[0]);
    } catch (e) {
      openErrorDialog(e);
    }
  };

  useEffect(() => {
    fetchBodyList();
    fetchFaceList();
  }, []);

  return (
    <Container>
      <div className='flexRow gap-[60px]'>
        <div className='items-center h-full bg-black pointer-events-none select-none flexRow'>
          {!(selectedBody && selectedFace) && <div className='bg-black w-[300px] h-[300px]' />}
          {selectedBody && selectedFace && (
            <Image
              src={selectedBody.image}
              alt={selectedBody.name}
              width={300}
              height={300}
              sizes='(max-width:300px)'
              className='bg-black min-w-[300px]'
            />
          )}
        </div>
        <div className='w-full flexCol'>
          <Tab.Group>
            <Tab.List className={cn('w-full flexRow')}>
              <CustomTab tabTitle='body' variant='line' />
              <CustomTab tabTitle='face' variant='line' />
              <div className='flex-1 border-b-[1px] border-b-gray-400' />
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel tabIndex={0}>
                <AvatarBodyList
                  list={bodyList}
                  selected={selectedBody}
                  setSelected={setSelectedBody}
                />
              </Tab.Panel>
              <Tab.Panel tabIndex={1}>
                <AvatarFaceList
                  list={faceList}
                  selected={selectedFace}
                  setSelected={setSelectedFace}
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <CustomLink
            href={ROUTES.PARTIES.index}
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
      <BackButton text='뭘 입고 놀아볼까요?' className='absolute top-10 left-[60px]' />
      <div className='h-full flexCol justify-start max-w-screen-desktop mx-auto gap-10 pt-[112px] pb-10 px-[60px]'>
        {children}
      </div>
    </div>
  );
}

export default AvatarSettingForm;
