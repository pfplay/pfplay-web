import { Metadata } from 'next';
import React from 'react';
import ProfileSettings from '@/components/_features/Profile/ProfileSettings';

export const metadata: Metadata = {
  title: 'Profile Edit',
  description: '', // TODO: add description
};

const ProfileSettingsPage = () => {
  return <ProfileSettings />;
};

export default ProfileSettingsPage;
