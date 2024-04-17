import { SubmitHandler } from 'react-hook-form';
import { useFetchPlaylist } from '@/api/react-query/playlist/use-fetch-playlist.query';
import { useUpdatePlaylist } from '@/api/react-query/playlist/use-update-playlist.mutation';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './playlist-form.component';

type PlaylistUpdateFormProps = Pick<PlaylistFormProps, 'onCancel'> & {
  listId: number;
};
const PlaylistUpdateFormComponent = ({ listId, ...props }: PlaylistUpdateFormProps) => {
  const { mutate: updatePlaylist } = useUpdatePlaylist();
  const { data } = useFetchPlaylist();

  const target = data?.find((v) => v.id === listId);

  const handleSubmit: SubmitHandler<PlaylistFormType> = async ({ name }) => {
    updatePlaylist(
      { listId, name },
      {
        onSettled: () => props.onCancel?.(),
      }
    );
  };
  return <PlaylistForm onSubmit={handleSubmit} defaultValues={{ name: target?.name }} {...props} />;
};

export default PlaylistUpdateFormComponent;
