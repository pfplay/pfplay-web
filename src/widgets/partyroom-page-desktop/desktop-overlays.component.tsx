'use client';

import { SidebarPlayer } from '@/widgets/music-preview-player';
import { MyPlaylist } from '@/widgets/my-playlist';

/**
 * 데스크탑 전용 overlay 3개 묶음.
 *
 * 본 컴포넌트는 데스크탑 lobby/room shell 안에서 단 한 번 mount 된다.
 * 모바일 트리에는 import 되지 않음 — 별도 트리(`widgets-mobile/`)가 가짐.
 *
 * 기존: `app/parties/layout.tsx` (ProtectedLayout) 에서 children 의 sibling 으로 mount.
 * 본 chunk 1 에서 desktop shell 내부로 이동(모바일 누출 차단).
 */
export const DesktopOverlays = () => {
  return (
    <>
      <MyPlaylist />
      {/* ⓐ 사이드바 미리보기 플레이어 (플레이리스트 트랙용) */}
      <SidebarPlayer />
      {/* 검색 결과 미리듣기는 검색 모달 내부 우측 컬럼으로 임베드됨(SearchPreviewPanel, issue #420) —
          별도 floating ModalPlayer 제거. */}
    </>
  );
};
