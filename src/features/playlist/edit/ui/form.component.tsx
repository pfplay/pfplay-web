import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import {
  PlaylistForm,
  PlaylistFormProps,
  PlaylistFormValues,
  usePlaylistAction,
} from '@/entities/playlist';
import { Playlist } from '@/shared/api/types/playlist';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useUpdatePlaylist } from '../api/use-update-playlist.mutation';

export default function useEditPlaylistDialog() {
  const t = useI18n();
  const { openDialog } = useDialog();

  return useCallback((listId: Playlist['id']) => {
    openDialog((_, onCancel) => ({
      title: t.playlist.para.enter_playlist_name,
      Body: <Form listId={listId} onCancel={onCancel} />,
    }));
  }, []);
}

type FormProps = Pick<PlaylistFormProps, 'onCancel'> & {
  listId: number;
};
const Form = ({ listId, ...props }: FormProps) => {
  const { mutate: updatePlaylist } = useUpdatePlaylist();
  const playlistAction = usePlaylistAction();
  const target = playlistAction.list.find((v) => v.id === listId);

  const handleSubmit: SubmitHandler<PlaylistFormValues> = async ({ name }) => {
    updatePlaylist(
      { listId, name },
      {
        onSettled: () => props.onCancel?.(),
      }
    );
  };

  return <PlaylistForm onSubmit={handleSubmit} defaultValues={{ name: target?.name }} {...props} />;
};
