import { ProfileEdit } from '@/components/_features/profile/profile-edit';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Profile Edit',
  description: '', // TODO: add description
};

export default function ProfileEditPage() {
  return <ProfileEdit />;
}

