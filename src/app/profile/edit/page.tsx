import ProfileEdit from '@/components/_features/profile/ProfileEdit';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Profile Edit',
  description: '', // TODO: add description
};

const ProfileEditPage = () => {
  return <ProfileEdit />;
};

export default ProfileEditPage;

