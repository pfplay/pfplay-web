import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { usePlaylistQuery } from '@/api/query-temp/playlist/usePlaylistQuery';
import { useUpdatePlaylistMutation } from '@/api/query-temp/playlist/useUpdatePlaylistMutation';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './PlaylistForm';

type PlaylistUpdateFormProps = Pick<PlaylistFormProps, 'onCancel'> & {
  listId: number;
};
const PlaylistUpdateForm = ({ listId, ...props }: PlaylistUpdateFormProps) => {
  const { mutate: updatePlaylist } = useUpdatePlaylistMutation();
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
