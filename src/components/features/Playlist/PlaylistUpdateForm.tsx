import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { usePlaylistQuery } from '@/api/react-query/Playlist/usePlaylistQuery';
import { usePlaylistUpdateMutation } from '@/api/react-query/Playlist/usePlaylistUpdateMutation';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './PlaylistForm';

type PlaylistUpdateFormProps = Pick<PlaylistFormProps, 'onCancel'> & {
  listId: number;
};
const PlaylistUpdateForm = ({ listId, ...props }: PlaylistUpdateFormProps) => {
  const { mutate: updatePlaylist } = usePlaylistUpdateMutation();
  const { data } = usePlaylistQuery();

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

export default PlaylistUpdateForm;
