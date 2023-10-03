import { Metadata } from 'next';
import React from 'react';
import AvatarSettingForm from '@/components/@features/Avatar/AvatarSettingForm';

export const metadata: Metadata = {
  title: 'Avatar Edit',
  description: '', // TODO: add description
};

const AvatarSettingsPage = () => {
  return <AvatarSettingForm withLayout />;
};

export default AvatarSettingsPage;
