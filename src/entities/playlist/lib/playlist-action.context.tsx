import { createContext, ReactNode, useContext } from 'react';
import {
  AddTrackToPlaylistRequestBody,
  Playlist,
  PlaylistTrack,
} from '@/shared/api/http/types/playlists';

export type PlaylistActionOptions = {
  onSuccess?: () => void;
};

type PlaylistAction = {
  list: Playlist[];

  add: () => void;
  edit: (targetId: Playlist['id']) => void;
  remove: (targetIds: Playlist['id'][], options?: PlaylistActionOptions) => void;

  addTrack: (targetId: Playlist['id'], track: AddTrackToPlaylistRequestBody) => void;
  removeTrack: (targetId: Playlist['id'], trackIds: PlaylistTrack['linkId']) => void;
  moveTrack: (params: {
    playlistId: number;
    trackId: number;
    nextOrderNumber: number;
  }) => Promise<void>;
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
