import { Metadata } from 'next';
import React from 'react';
import ProfileSettings from '@/components/_features/Profile/ProfileSettings';

export const metadata: Metadata = {
  title: 'Profile Edit',
  description: '', // TODO: add description
};

const ProfileSettingsPage = () => {
  // TODO: User middleware matcher + session to prevent unathorized access
  return <ProfileSettings />;
};

export default ProfileSettingsPage;
