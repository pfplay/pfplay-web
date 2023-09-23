import { Metadata } from 'next';
import React from 'react';
import ProfileSettingForm from '@/components/@features/Profile/ProfileSettingForm';
import BackButton from '@/components/@shared/BackButton';

export const metadata: Metadata = {
  title: 'Profile Edit',
  description: '', // TODO: add description
};

const ProfileSettingsPage = () => {
  return (
    // TODO: add padding responsive with/ without width
    <section className='relative min-w-laptop tablet:w-tablet laptop:w-desktop flexCol mx-auto pt-10 px-[60px] bg-gray-800'>
      <BackButton text='당신은 누구신가요?' className='self-start' />
      <ProfileSettingForm />
    </section>
  );
};

export default ProfileSettingsPage;
