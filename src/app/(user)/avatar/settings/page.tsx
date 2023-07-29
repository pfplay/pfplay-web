import { Metadata } from 'next';
import React from 'react';
import AvatarSettings from '@/components/_features/Avatar/AvatarSettings';

export const metadata: Metadata = {
  title: 'Avatar Edit',
  description: '', // TODO: add description
};

const AvatarSettingsPage = () => {
  return <AvatarSettings />;
};

export default AvatarSettingsPage;
