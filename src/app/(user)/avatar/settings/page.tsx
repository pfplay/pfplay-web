import { Metadata } from 'next';
import React from 'react';
import AvatarSettingForm from '@/components/@features/Avatar/AvatarSettingForm';
import BackButton from '@/components/@shared/BackButton';

export const metadata: Metadata = {
  title: 'Avatar Edit',
  description: '', // TODO: add description
};

const AvatarSettingsPage = () => {
  return (
    <section className='absolute-user-form-section'>
      <BackButton text='뭘 입고 놀아볼까요?' className='absolute top-10 left-[60px]' />
      <div className='h-full flexCol justify-start max-w-screen-desktop mx-auto gap-10 pt-[112px] pb-10 px-[60px]'>
        <AvatarSettingForm />
      </div>
    </section>
  );
};

export default AvatarSettingsPage;
