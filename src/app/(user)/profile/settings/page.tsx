import { Metadata } from 'next';
import React from 'react';
import ProfileSettings from '@/components/@features/Profile/ProfileSettings';

export const metadata: Metadata = {
  title: 'Profile Edit',
  description: '', // TODO: add description
};

const ProfileSettingsPage = () => {
  return <ProfileSettings />;
};

export default ProfileSettingsPage;
