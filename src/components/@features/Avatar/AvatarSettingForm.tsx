'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import CustomTab from '@/components/@shared/@atoms/CustomTab';
import CustomLink from '@/components/@shared/CustomLink';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/routes';
import AvatarBody from './AvatarBody';
import AvatarFace from './AvatarFace';
import { AvatarImg } from './AvatarImage';

const avatarSettingTabConfig: Array<{ name: 'body' | 'face'; index: number }> = [
  { name: 'body', index: 0 },
  { name: 'face', index: 1 },
];

const AvatarSettingForm = () => {
  const [selectedBody, setSelectedBody] = useState<AvatarImg>(mockAvatarBodyList[0]);
  const [selectedFace, setSelectedFace] = useState<AvatarImg>(mockAvatarBodyList[0]); // FIXME: Avatar face type 정해면 재정의

  return (
    <div className='flexRow gap-[60px]'>
      <div className='items-center h-full bg-black pointer-events-none select-none flexRow'>
        <Image
          src={selectedBody.image}
          alt={selectedBody.name}
          width={300}
          height={300}
          sizes='(max-width:300px)'
          className='bg-black min-w-[300px]'
        />
      </div>
      <div className='w-full flexCol'>
        <Tab.Group>
          <Tab.List className={cn('w-full flexRow')}>
            {avatarSettingTabConfig.map((tab) => (
              <CustomTab key={tab.index} tabTitle={tab.name} variant='line' />
            ))}
            <div className='flex-1 border-b-[1px] border-b-gray-400' />
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel tabIndex={avatarSettingTabConfig[0].index}>
              <AvatarBody selectedBody={selectedBody} setSelectedBody={setSelectedBody} />
            </Tab.Panel>
            <Tab.Panel tabIndex={avatarSettingTabConfig[1].index}>
              <AvatarFace selectedFace={selectedFace} setSelectedFace={setSelectedFace} />
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
  );
};

export default AvatarSettingForm;
