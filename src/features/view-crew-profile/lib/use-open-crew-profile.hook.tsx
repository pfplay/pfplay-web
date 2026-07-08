'use client';

import { useDialog } from '@/shared/ui/components/dialog';
import CrewProfileCard from '../ui/crew-profile-card.component';

/**
 * crew 프로필 모달 열기(#409). 크루 목록·채팅 등 어디서든 재사용하는 단일 트리거.
 * 운영 액션(등급조정/차단)과 별개로, 아바타/닉네임 클릭으로 모두에게 노출한다.
 */
export function useOpenCrewProfile() {
  const { openDialog } = useDialog();

  return (crewId: number) =>
    openDialog(() => ({
      showCloseIcon: true,
      Body: <CrewProfileCard crewId={crewId} />,
    }));
}
