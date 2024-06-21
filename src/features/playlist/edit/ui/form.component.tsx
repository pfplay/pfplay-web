import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import {
  PlaylistForm,
  PlaylistFormProps,
  PlaylistFormValues,
  usePlaylistAction,
} from '@/entities/playlist';
import { Playlist } from '@/shared/api/types/playlist';
import { useDialog } from '@/shared/ui/components/dialog';
import { useUpdatePlaylist } from '../api/use-update-playlist.mutation';

export default function useEditPlaylistDialog() {
  const { openDialog } = useDialog();

  return useCallback((listId: Playlist['id']) => {
    openDialog((_, onCancel) => ({
      title: '플레이리스트 이름을 입력해주세요',
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
