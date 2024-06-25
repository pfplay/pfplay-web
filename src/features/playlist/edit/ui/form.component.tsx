import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PlaylistForm, PlaylistFormProps, PlaylistFormValues } from '@/entities/playlist';
import { Playlist } from '@/shared/api/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useUpdatePlaylist } from '../api/use-update-playlist.mutation';

export default function useEditPlaylistDialog(playlists: Playlist[]) {
  const t = useI18n();
  const { openDialog } = useDialog();

  return useCallback(
    (listId: Playlist['id']) => {
      const target = playlists.find((p) => p.id === listId);
      if (!target) return;

      openDialog((_, onCancel) => ({
        title: t.playlist.para.enter_playlist_name,
        Body: <Form target={target} onCancel={onCancel} />,
      }));
    },
    [playlists, t]
  );
}

type FormProps = Pick<PlaylistFormProps, 'onCancel'> & {
  target: Playlist;
};
const Form = ({ target, ...props }: FormProps) => {
  const { mutate: updatePlaylist } = useUpdatePlaylist();

  const handleSubmit: SubmitHandler<PlaylistFormValues> = async (values) => {
    updatePlaylist(
      {
        listId: target.id,
        ...values,
      },
      {
        onSettled: () => props.onCancel?.(),
      }
    );
  };

  return <PlaylistForm onSubmit={handleSubmit} defaultValues={{ name: target.name }} {...props} />;
};
