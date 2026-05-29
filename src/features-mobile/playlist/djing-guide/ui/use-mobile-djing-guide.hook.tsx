'use client';
import { useCallback } from 'react';
import { useUserPreferenceStore } from '@/entities/preference';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import GuideLayout from './guide-layout.component';

/**
 * 모바일 DJ 가이드 hook (spec §5.8).
 * 데스크탑 useDjingGuide 의 모바일 사본.
 *
 * - showDjingGuide = !djingGuideHidden (useUserPreferenceStore)
 * - openDjingGuideModal: GuideLayout 를 FullscreenSheet 에 push
 * - onDismissPermanent → setDjingGuideHidden(true)
 */
export default function useMobileDjingGuide() {
  const djingGuideHidden = useUserPreferenceStore((s) => s.djingGuideHidden);
  const setDjingGuideHidden = useUserPreferenceStore((s) => s.setDjingGuideHidden);
  const { push, pop } = useFullscreenSheet();

  const openDjingGuideModal = useCallback(() => {
    push({
      key: 'djing-guide',
      title: 'DJ 규칙',
      node: <GuideLayout onClose={pop} onDismissPermanent={() => setDjingGuideHidden(true)} />,
    });
  }, [push, pop, setDjingGuideHidden]);

  return {
    showDjingGuide: !djingGuideHidden,
    openDjingGuideModal,
  };
}
