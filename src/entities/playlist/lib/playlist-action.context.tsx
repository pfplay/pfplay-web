import { createContext, ReactNode, useContext } from 'react';
import { AddPlaylistMusicRequestBody, Playlist, PlaylistMusic } from '@/shared/api/types/playlist';

export type PlaylistActionrOptions = {
  onSuccess?: () => void;
};

type PlaylistAction = {
  list: Playlist[];

  add: () => void;
  edit: (targetId: Playlist['id']) => void;
  remove: (targetIds: Playlist['id'][], options?: PlaylistActionrOptions) => void;

  addMusic: (targetId: Playlist['id'], music: AddPlaylistMusicRequestBody) => void;
  /**
   * TODO: API 측에 명세 문의 필요 - https://pfplay.slack.com/archives/C051N8A0ZSB/p1718969303410129
   */
  removeMusics: (/* targetId: Playlist['id'], */ musicIds: PlaylistMusic['musicId'][]) => void;
  /**
   * TODO: API 안나옴
   */
  // moveMusic: (from: Playlist['id'], to: Playlist['id'], musicId: PlaylistMusic['musicId']) => void;
};

export const PlaylistActionContext = createContext<PlaylistAction | null>(null);

/**
 * portal 내부(ex-dialog body)로 context value를 bypass할 때 사용
 */
export const PlaylistActionBypassProvider = ({
  children,
  action,
}: {
  children: ReactNode;
  action: PlaylistAction;
}) => {
  return <PlaylistActionContext.Provider value={action}>{children}</PlaylistActionContext.Provider>;
};

export const usePlaylistAction = () => {
  const context = useContext(PlaylistActionContext);

  if (!context) {
    throw new Error('usePlaylistAction must be used within a PlaylistActionProvider');
  }

  return context;
};
